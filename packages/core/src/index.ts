// Engine
export { RiskProfilerEngine } from './engine.js';
export type {
  EvaluateManyOptions,
  RiskProfilerEngineOptions,
} from './engine.js';

// Definition compiler
export {
  checksumJdmGraph,
  compileRiskProfileDefinition,
} from './compiler.js';
export type { CompiledRiskProfileDefinition } from './compiler.js';

// CSV import helpers
export { parseCsvBatch } from './csv.js';

// Loader - exported so consumers can build custom loaders
export {
  createDefaultLoader,
  createGraphLoader,
  DEFAULT_GRAPH_KEY,
} from './loader.js';
export type { JdmGraphLoader } from './loader.js';

// Static data - useful for UI adapters and the CLI
export { ALLOCATION_MAP } from './allocations.js';
export { DEFAULT_RISK_PROFILE_DEFINITION } from './definition.js';
export { QUESTIONS } from './questions.js';
