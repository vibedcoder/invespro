import riskProfilerGraph from './graphs/risk-profiler.json' with { type: 'json' };

export const DEFAULT_GRAPH_KEY = 'risk-profiler' as const;

/**
 * A ZenEngine-compatible loader.
 */
export type JdmGraphLoader = (key: string) => Promise<Buffer>;

/**
 * Creates a loader serving the bundled default JDM graphs.
 * Pass `overrides` to replace or extend the default graph set.
 */
export function createDefaultLoader(
  overrides: Record<string, unknown> = {},
): JdmGraphLoader {
  const graphs = new Map<string, unknown>([
    [DEFAULT_GRAPH_KEY, riskProfilerGraph],
    ...Object.entries(overrides),
  ]);

  return async (key: string): Promise<Buffer> => {
    const graph = graphs.get(key);
    if (graph === undefined) {
      throw new Error(
        `[invespro-core] Graph not found: "${key}". ` +
          `Available: ${[...graphs.keys()].join(', ')}`,
      );
    }
    // ZenEngine accepts Buffer — serialize the in-memory object to JSON bytes
    return Buffer.from(JSON.stringify(graph));
  };
}