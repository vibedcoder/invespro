import { ZenEngine } from '@gorules/zen-engine';
import { ApplicantInputSchema } from '@vibedcoder/invespro-types';
import type { ApplicantInput, EvaluationResult } from '@vibedcoder/invespro-types';
import { ALLOCATION_MAP } from './allocations.js';
import { createDefaultLoader, DEFAULT_GRAPH_KEY } from './loader.js';
import type { JdmGraphLoader } from './loader.js';
import { fromJdmResult, toJdmInput } from './transform.js';

export interface RiskProfilerEngineOptions {
  /** Supply a custom loader to use your own JDM graphs instead of the bundled defaults. */
  readonly loader?: JdmGraphLoader;
  /** The graph key to evaluate. Defaults to 'risk-profiler'. */
  readonly graphKey?: string;
  /** Version string stamped on every EvaluationResult for auditability. */
  readonly jdmVersion?: string;
}

export class RiskProfilerEngine {
  private readonly zen: ZenEngine;
  private readonly graphKey: string;
  private readonly jdmVersion: string;
  private disposed = false;

  constructor(options: RiskProfilerEngineOptions = {}) {
    const loader = options.loader ?? createDefaultLoader();
    this.graphKey = options.graphKey ?? DEFAULT_GRAPH_KEY;
    this.jdmVersion = options.jdmVersion ?? '0.1.0';
    this.zen = new ZenEngine({ loader });
  }

  async evaluate(input: ApplicantInput): Promise<EvaluationResult> {
    if (this.disposed) {
      throw new Error('[invespro-core] Engine has been disposed. Create a new instance.');
    }

    // Step 1 — validate input at the system boundary
    const validated = ApplicantInputSchema.parse(input);

    // Step 2 — transform to snake_case for the JDM engine
    const jdmInput = toJdmInput(validated);

    // Step 3 — run the decision graph
    const { result: rawResult } = await this.zen.evaluate(this.graphKey, jdmInput);

    // Step 4 — validate and map the raw JDM output
    const { totalScore, riskProfile } = fromJdmResult(rawResult);

    // Step 5 — look up asset allocation by risk band
    const allocation = ALLOCATION_MAP[riskProfile];

    // Step 6 — assemble the typed result
    return {
      applicantId: validated.applicantId,
      totalScore,
      riskProfile,
      overrideApplied: false,
      allocation,
      evaluatedAt: new Date().toISOString(),
      jdmVersion: this.jdmVersion,
    };
  }

  /**
   * Releases the underlying native engine resources.
   * Always call this when you are done with the engine instance.
   */
  dispose(): void {
    if (!this.disposed) {
      this.zen.dispose();
      this.disposed = true;
    }
  }
}