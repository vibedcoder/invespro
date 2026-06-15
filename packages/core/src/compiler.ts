import { createHash } from 'node:crypto';
import {
  RiskProfileDefinitionSchema,
} from '@vibedcoder/invespro-types';
import type {
  DefinitionOverride,
  DefinitionScoreRule,
  RiskProfileDefinition,
  RiskProfileDefinitionInput,
} from '@vibedcoder/invespro-types';
import { DEFAULT_GRAPH_KEY } from './constants.js';

export interface CompiledRiskProfileDefinition {
  readonly definition: RiskProfileDefinition;
  readonly graphKey: string;
  readonly graph: Record<string, unknown>;
  readonly graphChecksum: string;
}

/**
 * Compiles a validated investment-risk definition into a deterministic JDM graph.
 *
 * The same normalized definition always produces the same graph identifiers and
 * checksum, which allows evaluation results to identify the exact executed rules.
 */
export function compileRiskProfileDefinition(
  input: RiskProfileDefinitionInput,
): CompiledRiskProfileDefinition {
  const definition = RiskProfileDefinitionSchema.parse(input);
  const factory = new GraphFactory(definition.id);
  const request = factory.node('request', 'request', 'inputNode', { schema: '' });
  const response = factory.node('response', 'response', 'outputNode', { schema: '' });

  const factorNodes = definition.scoring.map((factor) => {
    const question = definition.questions.find(
      (candidate) => candidate.id === factor.questionId,
    );
    if (question === undefined) {
      throw new Error(`Missing question "${factor.questionId}" after validation.`);
    }

    return factory.node(
      `factor:${factor.questionId}`,
      question.text,
      'decisionTableNode',
      decisionTable({
        inputName: question.text,
        inputField: toSnakeCase(question.id),
        outputName: `${question.text} Score`,
        outputField: scoreField(question.id),
        rules: factor.rules,
        factory,
        path: `factor:${factor.questionId}`,
      }),
    );
  });

  const rawScoreExpression = definition.scoring
    .map((factor) => scoreField(factor.questionId))
    .join(' + ');
  const totalWeight = definition.scoring.reduce(
    (sum, factor) => sum + factor.weight,
    0,
  );
  const normalizedExpression = definition.scoring
    .map((factor) => {
      const maximum = Math.max(...factor.rules.map((rule) => rule.score));
      return `(${scoreField(factor.questionId)} / ${maximum} * ${factor.weight})`;
    })
    .join(' + ');
  const aggregate = factory.node(
    'aggregate',
    'Calculate Scores',
    'expressionNode',
    {
      expressions: [
        {
          id: factory.id('expression:rawScore'),
          key: 'raw_score',
          value: rawScoreExpression,
        },
        {
          id: factory.id('expression:normalizedScore'),
          key: 'normalized_score',
          value: `((${normalizedExpression}) / ${totalWeight}) * 100`,
        },
      ],
      passThrough: true,
      inputField: null,
      outputPath: null,
      executionMode: 'single',
    },
  );

  const profile = factory.node(
    'profile',
    'Determine Risk Profile',
    'decisionTableNode',
    profileTable(definition, factory),
  );

  for (const factor of factorNodes) {
    factory.edge(`request:${factor.id}`, request, factor);
    factory.edge(`factor:${factor.id}:aggregate`, factor, aggregate);
  }

  const overrideNodes = definition.overrides.map((override) =>
    factory.node(
      `override:${override.id}`,
      override.description ?? override.id,
      'decisionTableNode',
      overrideTable(override, factory),
    ),
  );

  if (definition.overrides.length === 0) {
    factory.edge('aggregate:profile', aggregate, profile);
  } else {
    const switchNode = factory.node(
      'overrideSwitch',
      'Apply Overrides',
      'switchNode',
      {
        hitPolicy: 'first',
        statements: [
          ...definition.overrides.map((override) => ({
            id: factory.id(`overrideStatement:${override.id}`),
            condition: overrideExpression(override),
            isDefault: false,
          })),
          {
            id: factory.id('overrideStatement:default'),
            condition: '',
            isDefault: true,
          },
        ],
      },
    );
    factory.edge('aggregate:overrideSwitch', aggregate, switchNode);
    definition.overrides.forEach((override, index) => {
      const overrideNode = overrideNodes[index];
      if (overrideNode === undefined) return;
      factory.edge(
        `overrideSwitch:${override.id}`,
        switchNode,
        overrideNode,
        factory.id(`overrideStatement:${override.id}`),
      );
    });
    factory.edge(
      'overrideSwitch:default',
      switchNode,
      profile,
      factory.id('overrideStatement:default'),
    );
  }

  factory.edge('profile:response', profile, response);
  for (const overrideNode of overrideNodes) {
    factory.edge(`override:${overrideNode.id}:response`, overrideNode, response);
  }

  const graph = {
    contentType: 'application/vnd.gorules.decision',
    nodes: factory.nodes,
    edges: factory.edges,
  };
  return {
    definition,
    graphKey: DEFAULT_GRAPH_KEY,
    graph,
    graphChecksum: checksumJdmGraph(graph),
  };
}

/**
 * Returns the SHA-256 checksum of a JDM graph after canonical key ordering.
 */
export function checksumJdmGraph(graph: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalStringify(graph)).digest('hex')}`;
}

interface DecisionTableOptions {
  readonly inputName: string;
  readonly inputField: string;
  readonly outputName: string;
  readonly outputField: string;
  readonly rules: readonly DefinitionScoreRule[];
  readonly factory: GraphFactory;
  readonly path: string;
}

function decisionTable(options: DecisionTableOptions): Record<string, unknown> {
  const inputId = options.factory.id(`${options.path}:input`);
  const outputId = options.factory.id(`${options.path}:output`);
  return {
    hitPolicy: 'first',
    rules: options.rules.map((rule, index) => ({
      _id: options.factory.id(`${options.path}:rule:${index}`),
      [inputId]: ruleExpression(rule),
      [outputId]: String(rule.score),
    })),
    inputs: [
      {
        id: inputId,
        name: options.inputName,
        field: options.inputField,
      },
    ],
    outputs: [
      {
        id: outputId,
        name: options.outputName,
        field: options.outputField,
      },
    ],
    passThrough: true,
    inputField: null,
    outputPath: null,
    executionMode: 'single',
  };
}

function profileTable(
  definition: RiskProfileDefinition,
  factory: GraphFactory,
): Record<string, unknown> {
  const inputId = factory.id('profile:input');
  const profileOutputId = factory.id('profile:output:profileId');
  const overrideOutputId = factory.id('profile:output:overrideApplied');
  const bands = [...definition.scoreBands].sort(
    (left, right) => right.minScore - left.minScore,
  );

  return {
    hitPolicy: 'first',
    rules: bands.map((band, index) => ({
      _id: factory.id(`profile:rule:${index}`),
      [inputId]: `>= ${Math.max(0, band.minScore - 1e-9)}`,
      [profileOutputId]: JSON.stringify(band.profileId),
      [overrideOutputId]: 'false',
    })),
    inputs: [
      {
        id: inputId,
        name: 'Normalized Score',
        field: 'normalized_score',
      },
    ],
    outputs: [
      {
        id: profileOutputId,
        name: 'Profile ID',
        field: 'profile_id',
      },
      {
        id: overrideOutputId,
        name: 'Override Applied',
        field: 'override_applied',
      },
    ],
    passThrough: true,
    inputField: null,
    outputPath: null,
    executionMode: 'single',
  };
}

function overrideTable(
  override: DefinitionOverride,
  factory: GraphFactory,
): Record<string, unknown> {
  const inputId = factory.id(`override:${override.id}:input`);
  const profileOutputId = factory.id(`override:${override.id}:output:profileId`);
  const appliedOutputId = factory.id(`override:${override.id}:output:applied`);
  const idOutputId = factory.id(`override:${override.id}:output:id`);
  return {
    hitPolicy: 'first',
    rules: [
      {
        _id: factory.id(`override:${override.id}:rule`),
        [inputId]: '',
        [profileOutputId]: JSON.stringify(override.profileId),
        [appliedOutputId]: 'true',
        [idOutputId]: JSON.stringify(override.id),
      },
    ],
    inputs: [{ id: inputId, name: 'Input' }],
    outputs: [
      { id: profileOutputId, name: 'Profile ID', field: 'profile_id' },
      { id: appliedOutputId, name: 'Override Applied', field: 'override_applied' },
      { id: idOutputId, name: 'Override ID', field: 'override_id' },
    ],
    passThrough: true,
    inputField: null,
    outputPath: null,
    executionMode: 'single',
  };
}

function ruleExpression(rule: DefinitionScoreRule): string {
  if (rule.type === 'option') return JSON.stringify(rule.value);
  if (rule.min !== undefined && rule.max !== undefined) {
    const left = rule.includeMin ? '[' : '(';
    const right = rule.includeMax ? ']' : ')';
    return `${left}${rule.min}..${rule.max}${right}`;
  }
  if (rule.min !== undefined) {
    return `${rule.includeMin ? '>=' : '>'} ${rule.min}`;
  }
  return `${rule.includeMax ? '<=' : '<'} ${rule.max}`;
}

function overrideExpression(override: DefinitionOverride): string {
  return `${toSnakeCase(override.questionId)} ${override.operator} ${JSON.stringify(override.value)}`;
}

export function toSnakeCase(value: string): string {
  return value.replace(/[A-Z]/g, (character) => `_${character.toLowerCase()}`);
}

export function scoreField(questionId: string): string {
  return `${toSnakeCase(questionId)}_score`;
}

interface GraphNode {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly content: Record<string, unknown>;
  readonly position: { readonly x: number; readonly y: number };
}

interface GraphEdge {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
  readonly sourceHandle?: string;
  readonly type: 'edge';
}

class GraphFactory {
  readonly nodes: GraphNode[] = [];
  readonly edges: GraphEdge[] = [];

  constructor(private readonly namespace: string) {}

  id(path: string): string {
    const hash = createHash('sha256')
      .update(`${this.namespace}:${path}`)
      .digest('hex')
      .slice(0, 32);
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20)}`;
  }

  node(
    path: string,
    name: string,
    type: string,
    content: Record<string, unknown>,
  ): GraphNode {
    const node = {
      id: this.id(`node:${path}`),
      name,
      type,
      content,
      position: {
        x: this.nodes.length * 220,
        y: 0,
      },
    };
    this.nodes.push(node);
    return node;
  }

  edge(
    path: string,
    source: GraphNode,
    target: GraphNode,
    sourceHandle?: string,
  ): void {
    this.edges.push({
      id: this.id(`edge:${path}`),
      sourceId: source.id,
      targetId: target.id,
      ...(sourceHandle !== undefined && { sourceHandle }),
      type: 'edge',
    });
  }
}

function canonicalStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value === null || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalize(entry)]),
  );
}
