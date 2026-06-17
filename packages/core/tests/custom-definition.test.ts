import { afterEach, describe, expect, it } from 'vitest';
import {
  compileRiskProfileDefinition,
  createGraphLoader,
  parseCsvBatch,
  RiskProfilerEngine,
} from '../src/index.js';
import type { RiskProfileDefinitionInput } from '@vibedcoder/invespro-types';

const customDefinition = {
  schemaVersion: '1.0',
  id: 'customCapacityModel',
  name: 'Custom Capacity Model',
  version: '1.0.0',
  questions: [
    {
      id: 'riskCapacity',
      text: 'How much investment risk can you financially absorb?',
      purpose: 'scored',
      type: 'number',
      min: 0,
      max: 10,
    },
    {
      id: 'needsEmergencyAccess',
      text: 'Do you need emergency access to the investment?',
      purpose: 'override',
      type: 'boolean',
    },
    {
      id: 'adviserNote',
      text: 'Optional adviser classification',
      purpose: 'informational',
      required: false,
      type: 'select',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Review', value: 'review' },
      ],
    },
  ],
  scoring: [
    {
      questionId: 'riskCapacity',
      weight: 1,
      rules: [
        { type: 'range', max: 5, score: 0 },
        { type: 'range', min: 5, score: 10 },
      ],
    },
  ],
  profiles: [
    { id: 'capitalCare', label: 'Capital Care', order: 0 },
    { id: 'longTermGrowth', label: 'Long-term Growth', order: 1 },
  ],
  scoreBands: [
    { profileId: 'capitalCare', minScore: 0 },
    { profileId: 'longTermGrowth', minScore: 50 },
  ],
  assetClasses: [
    { id: 'growthAssets', label: 'Growth Assets' },
    { id: 'defensiveAssets', label: 'Defensive Assets' },
  ],
  allocations: {
    capitalCare: {
      growthAssets: 20,
      defensiveAssets: 80,
    },
    longTermGrowth: {
      growthAssets: 80,
      defensiveAssets: 20,
    },
  },
  overrides: [
    {
      id: 'emergencyAccess',
      questionId: 'needsEmergencyAccess',
      operator: '==',
      value: true,
      profileId: 'capitalCare',
    },
  ],
} satisfies RiskProfileDefinitionInput;

describe('definition-driven evaluation', () => {
  const engines: RiskProfilerEngine[] = [];

  afterEach(() => {
    engines.splice(0).forEach((engine) => engine.dispose());
  });

  it('evaluates custom questions, profiles, and asset classes', async () => {
    const engine = track(new RiskProfilerEngine({ definition: customDefinition }));
    const result = await engine.evaluate({
      applicantId: 'applicant-1',
      answers: {
        riskCapacity: 8,
        needsEmergencyAccess: false,
        adviserNote: 'standard',
      },
    });

    expect(result).toMatchObject({
      applicantId: 'applicant-1',
      rawScore: 10,
      normalizedScore: 100,
      profile: {
        id: 'longTermGrowth',
        label: 'Long-term Growth',
      },
      allocation: {
        growthAssets: 80,
        defensiveAssets: 20,
      },
      overrideApplied: false,
      definition: {
        id: 'customCapacityModel',
        version: '1.0.0',
      },
    });
    expect(result.definition.graphChecksum).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('parses CSV rows using custom definition question IDs', () => {
    const items = parseCsvBatch(
      [
        'applicantId,riskCapacity,needsEmergencyAccess,adviserNote',
        'APP-CSV,8,yes,review',
      ].join('\n'),
      compileRiskProfileDefinition(customDefinition).definition,
    );

    expect(items).toEqual([
      {
        applicantId: 'APP-CSV',
        answers: {
          riskCapacity: 8,
          needsEmergencyAccess: true,
          adviserNote: 'review',
        },
      },
    ]);
  });

  it('applies a custom override', async () => {
    const engine = track(new RiskProfilerEngine({ definition: customDefinition }));
    const result = await engine.evaluate({
      answers: {
        riskCapacity: 8,
        needsEmergencyAccess: true,
      },
    });

    expect(result.profile.id).toBe('capitalCare');
    expect(result.overrideApplied).toBe(true);
    expect(result.overrideId).toBe('emergencyAccess');
  });

  it('produces deterministic graphs and checksums', () => {
    const first = compileRiskProfileDefinition(customDefinition);
    const second = compileRiskProfileDefinition(customDefinition);

    expect(second.graph).toEqual(first.graph);
    expect(second.graphChecksum).toBe(first.graphChecksum);
  });

  it('rejects numeric scoring ranges with gaps', () => {
    const invalid = structuredClone(customDefinition);
    invalid.scoring[0]!.rules = [
      { type: 'range', max: 4, score: 0 },
      { type: 'range', min: 5, score: 10 },
    ];

    expect(() => compileRiskProfileDefinition(invalid)).toThrow(
      'Number scoring ranges contain a gap',
    );
  });

  it('rejects answers outside the declared contract', async () => {
    const engine = track(new RiskProfilerEngine({ definition: customDefinition }));

    await expect(
      engine.evaluate({
        answers: {
          riskCapacity: 11,
          needsEmergencyAccess: false,
          unknownQuestion: 'not allowed',
        },
      }),
    ).rejects.toThrow();
  });

  it('rejects a custom JDM result with an undeclared profile', async () => {
    const compiled = compileRiskProfileDefinition(customDefinition);
    const graph = structuredClone(compiled.graph) as {
      nodes: Array<{
        name: string;
        content: {
          outputs?: Array<{ id: string; field?: string }>;
          rules?: Array<Record<string, string>>;
        };
      }>;
    };
    const profileNode = graph.nodes.find(
      (node) => node.name === 'Determine Risk Profile',
    );
    const profileOutput = profileNode?.content.outputs?.find(
      (output) => output.field === 'profile_id',
    );
    if (profileOutput === undefined || profileNode?.content.rules === undefined) {
      throw new Error('Generated profile table was not found.');
    }
    profileNode.content.rules[0]![profileOutput.id] = '"undeclaredProfile"';

    const engine = track(
      new RiskProfilerEngine({
        definition: customDefinition,
        loader: createGraphLoader({ 'risk-profiler': graph }),
      }),
    );

    await expect(
      engine.evaluate({
        answers: {
          riskCapacity: 8,
          needsEmergencyAccess: false,
        },
      }),
    ).rejects.toThrow('undeclared profile');
  });

  it('verifies an expected custom graph checksum', async () => {
    const compiled = compileRiskProfileDefinition(customDefinition);
    const engine = track(
      new RiskProfilerEngine({
        definition: customDefinition,
        loader: createGraphLoader({ 'risk-profiler': compiled.graph }),
        graphChecksum: `sha256:${'0'.repeat(64)}`,
      }),
    );

    await expect(
      engine.evaluate({
        answers: {
          riskCapacity: 8,
          needsEmergencyAccess: false,
        },
      }),
    ).rejects.toThrow('checksum mismatch');
  });

  function track(engine: RiskProfilerEngine): RiskProfilerEngine {
    engines.push(engine);
    return engine;
  }
});
