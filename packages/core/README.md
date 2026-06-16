# @vibedcoder/invespro-core

Core engine for Invespro, a rules-based investment profiling and portfolio allocation system.

This package evaluates applicant answers against the default profiling model or a versioned custom definition, then returns a normalized score, risk profile, allocation, and definition metadata.

## Installation

```sh
pnpm add @vibedcoder/invespro-core
```

```sh
npm install @vibedcoder/invespro-core
```

## Quick Start

```ts
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';

const engine = await RiskProfilerEngine.create();

const result = await engine.evaluate({
  applicantId: 'APP-001',
  answers: {
    age: 34,
    investmentHorizon: 'fiveToTenYears',
    riskTolerance: 'moderate',
    objective: 'balancedGrowth',
    experience: 'some',
    liquidityNeeds: 'medium',
  },
});

console.log(result.profile.label);
console.log(result.allocation);
```

## Custom Definitions

You can compile and run a custom, versioned profiler definition while keeping the standard Invespro result contract.

```ts
import { RiskProfilerEngine, createDefaultRiskProfilerDefinition } from '@vibedcoder/invespro-core';

const definition = createDefaultRiskProfilerDefinition();

definition.id = 'myRiskModel';
definition.version = '2026.1.0';
definition.questions.riskTolerance.weight = 2;

const engine = await RiskProfilerEngine.create({ definition });
```

Custom definitions can change question labels, options, scores, weights, bands, profile IDs, and allocations. Expert custom JDM graphs are supported when they follow the Invespro graph contract.

## Result Shape

```json
{
  "applicantId": "APP-001",
  "rawScore": 38,
  "normalizedScore": 67.86,
  "profile": {
    "id": "moderatelyAggressive",
    "label": "Moderately Aggressive"
  },
  "overrideApplied": false,
  "allocation": {
    "equities": 70,
    "fixedIncome": 20,
    "cash": 5,
    "alternatives": 5
  },
  "definition": {
    "id": "invesproDefaultRiskProfiler",
    "version": "0.1.0",
    "schemaVersion": "1.0",
    "graphChecksum": "sha256:..."
  }
}
```

## Related Packages

- `@vibedcoder/invespro-types` provides schemas and types.
- `@vibedcoder/invespro-hono` exposes this engine through REST.
- `@vibedcoder/invespro-cli` evaluates inputs from the command line.

See the main project documentation at [github.com/vibedcoder/invespro](https://github.com/vibedcoder/invespro).
