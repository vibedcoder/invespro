import { ZenEngine } from '@gorules/zen-engine';
import type {
  ApplicantInput,
  EvaluationResult,
  RiskProfileDefinition,
  RiskProfileDefinitionInput,
  RiskProfileEvaluationInput,
} from '@vibedcoder/invespro-types';
import {
  checksumJdmGraph,
  compileRiskProfileDefinition,
} from './compiler.js';
import { DEFAULT_GRAPH_KEY } from './constants.js';
import {
  fromJdmResult,
  parseEvaluationInput,
  toJdmInput,
} from './contract.js';
import { DEFAULT_RISK_PROFILE_DEFINITION } from './definition.js';
import { createGraphLoader } from './loader.js';
import type { JdmGraphLoader } from './loader.js';

export interface RiskProfilerEngineOptions {
  /** Definition that declares the input, output, scoring, and allocation contract. */
  readonly definition?: RiskProfileDefinitionInput;
  /** Standard-contract custom JDM loader. Omit to compile the supplied definition. */
  readonly loader?: JdmGraphLoader;
  /** Loader key passed to ZenEngine. */
  readonly graphKey?: string;
  /** Known graph checksum, when the graph is managed outside this process. */
  readonly graphChecksum?: string;
}

/**
 * Evaluates versioned investment-risk definitions through ZenEngine.
 *
 * Custom JDM graphs may use any internal topology, but their inputs and outputs
 * must conform to the supplied definition contract.
 */
export class RiskProfilerEngine {
  readonly definition: RiskProfileDefinition;

  private readonly zen: ZenEngine;
  private readonly graphKey: string;
  private readonly checksumState: {
    value: string | undefined;
    expected: string | undefined;
  };
  private disposed = false;

  constructor(options: RiskProfilerEngineOptions = {}) {
    const definitionInput =
      options.definition ?? DEFAULT_RISK_PROFILE_DEFINITION;
    const compiled = compileRiskProfileDefinition(definitionInput);
    this.definition = compiled.definition;
    this.graphKey = options.graphKey ?? DEFAULT_GRAPH_KEY;
    this.checksumState = {
      value: options.loader === undefined ? compiled.graphChecksum : undefined,
      expected: options.graphChecksum,
    };

    const loader =
      options.loader === undefined
        ? createGraphLoader({ [this.graphKey]: compiled.graph })
        : captureChecksum(options.loader, this.checksumState);
    this.zen = new ZenEngine({ loader });
  }

  /**
   * Validates input against the definition, executes JDM, and returns an
   * allocation-enriched result with definition and graph audit metadata.
   */
  async evaluate(
    input: RiskProfileEvaluationInput | ApplicantInput | Record<string, unknown>,
  ): Promise<EvaluationResult> {
    this.assertActive();
    const parsed = parseEvaluationInput(this.definition, input);
    const { result } = await this.zen.evaluate(
      this.graphKey,
      toJdmInput(parsed.answers),
    );
    const checksum = this.checksumState.value;
    if (checksum === undefined) {
      throw new Error('[invespro-core] Unable to determine the evaluated graph checksum.');
    }
    return fromJdmResult(
      result,
      this.definition,
      checksum,
      parsed.applicantId,
    );
  }

  /**
   * Asks ZenEngine to load and structurally validate the configured graph.
   */
  async validate(): Promise<void> {
    this.assertActive();
    const decision = await this.zen.getDecision(this.graphKey);
    decision.validate();
  }

  /** Releases the native ZenEngine resources owned by this instance. */
  dispose(): void {
    if (!this.disposed) {
      this.zen.dispose();
      this.disposed = true;
    }
  }

  private assertActive(): void {
    if (this.disposed) {
      throw new Error('[invespro-core] Engine has been disposed. Create a new instance.');
    }
  }
}

function captureChecksum(
  loader: JdmGraphLoader,
  state: { value: string | undefined; expected: string | undefined },
): JdmGraphLoader {
  return async (key: string): Promise<Buffer> => {
    const content = await loader(key);
    if (state.value === undefined) {
      let graph: unknown;
      try {
        graph = JSON.parse(content.toString('utf8'));
      } catch {
        throw new Error('[invespro-core] Custom JDM loader returned invalid JSON.');
      }
      const checksum = checksumJdmGraph(graph);
      if (state.expected !== undefined && state.expected !== checksum) {
        throw new Error(
          `[invespro-core] JDM checksum mismatch. Expected ${state.expected}, received ${checksum}.`,
        );
      }
      state.value = checksum;
    }
    return content;
  };
}
