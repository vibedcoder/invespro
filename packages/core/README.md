# @vibedcoder/invespro-core

Core engine for Invespro, a rules-based investment profiling and portfolio
allocation system.

Use this package when you want to evaluate applicants directly inside a Node.js
service. It includes the default risk model, custom definition support, batch
evaluation, CSV batch parsing, and definition-to-JDM compilation helpers.

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

const engine = new RiskProfilerEngine();

try {
  const result = await engine.evaluate({
    applicantId: 'APP-001',
    answers: {
      investmentHorizonYears: 10,
      riskAttitude: 'hold',
      investmentObjective: 'balanced_growth',
      annualIncome: 75000,
      dtiRatio: 20,
      liquidityMonths: 4,
      investmentExperience: 'intermediate',
    },
  });

  console.log(result.profile.label);
  console.log(result.normalizedScore);
  console.log(result.allocation);
} finally {
  engine.dispose();
}
```

Call `engine.dispose()` when the engine is no longer needed so the underlying
ZenEngine resources are released.

## Batch Evaluation

```ts
const result = await engine.evaluateMany({
  items: [
    {
      applicantId: 'APP-001',
      answers: {
        investmentHorizonYears: 10,
        riskAttitude: 'hold',
        investmentObjective: 'balanced_growth',
        annualIncome: 75000,
        dtiRatio: 20,
        liquidityMonths: 4,
        investmentExperience: 'intermediate',
      },
    },
  ],
});
```

Batch results preserve input order. Each item is either `fulfilled` with an
evaluation result or `rejected` with validation details.

## CSV Batch Input

`parseCsvBatch` converts CSV rows into the same item shape accepted by
`RiskProfilerEngine.evaluateMany`.

```ts
import {
  DEFAULT_RISK_PROFILE_DEFINITION,
  parseCsvBatch,
  RiskProfilerEngine,
} from '@vibedcoder/invespro-core';

const csv = [
  'applicantId,investmentHorizonYears,riskAttitude,investmentObjective,annualIncome,dtiRatio,liquidityMonths,investmentExperience',
  'APP-001,10,hold,balanced_growth,75000,20,4,intermediate',
].join('\n');

const items = parseCsvBatch(csv, DEFAULT_RISK_PROFILE_DEFINITION);
const engine = new RiskProfilerEngine();
const result = await engine.evaluateMany({ items });
```

CSV columns should use the active definition's question IDs. The parser handles
numbers, booleans, select option values, optional `applicantId`, and omitted
empty cells.

## Custom Definitions

```ts
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';

const engine = new RiskProfilerEngine({ definition: customDefinition });
```

Custom definitions can change question labels, options, scores, weights, bands,
profile IDs, asset classes, allocations, and overrides while keeping the
standard Invespro result contract.

## Key Exports

- `RiskProfilerEngine`
- `DEFAULT_RISK_PROFILE_DEFINITION`
- `parseCsvBatch`
- `compileRiskProfileDefinition`
- `checksumJdmGraph`
- `createDefaultLoader`
- `createGraphLoader`

## Related Packages

- `@vibedcoder/invespro-types` provides schemas and types.
- `@vibedcoder/invespro-hono` exposes this engine through REST.
- `@vibedcoder/invespro-cli` evaluates inputs from the command line.

Full documentation: [invespro.vercel.app](https://invespro.vercel.app/).
