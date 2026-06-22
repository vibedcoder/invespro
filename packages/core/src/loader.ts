import { compileRiskProfileDefinition } from './compiler.js';
import { DEFAULT_GRAPH_KEY } from './constants.js';
import { DEFAULT_RISK_PROFILE_DEFINITION } from './definition.js';

export { DEFAULT_GRAPH_KEY } from './constants.js';

export type JdmGraphLoader = (key: string) => Promise<Buffer>;

/**
 * Creates a ZenEngine loader backed by in-memory JDM graph objects.
 */
export function createGraphLoader(
  graphs: Readonly<Record<string, unknown>>,
): JdmGraphLoader {
  return async (key: string): Promise<Buffer> => {
    const graph = graphs[key];
    if (graph === undefined) {
      throw new Error(
        `[helm-core] Graph not found: "${key}". ` +
          `Available: ${Object.keys(graphs).join(', ')}`,
      );
    }
    return Buffer.from(JSON.stringify(graph));
  };
}

/**
 * Creates a loader containing the compiled default definition.
 */
export function createDefaultLoader(
  overrides: Record<string, unknown> = {},
): JdmGraphLoader {
  const compiled = compileRiskProfileDefinition(
    DEFAULT_RISK_PROFILE_DEFINITION,
  );
  return createGraphLoader({
    [DEFAULT_GRAPH_KEY]: compiled.graph,
    ...overrides,
  });
}
