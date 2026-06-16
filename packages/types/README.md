# @vibedcoder/invespro-types

Shared TypeScript types and Zod schemas for Invespro, a rules-based investment profiling and portfolio allocation engine.

Use this package when you want to validate request payloads, definition files, questionnaire answers, or evaluation results without depending on the core ZenEngine runtime.

## Installation

```sh
pnpm add @vibedcoder/invespro-types
```

```sh
npm install @vibedcoder/invespro-types
```

## Usage

```ts
import { EvaluateInputSchema, RiskProfilerDefinitionSchema } from '@vibedcoder/invespro-types';

const input = EvaluateInputSchema.parse({
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

const definition = RiskProfilerDefinitionSchema.parse(customDefinition);
```

## What It Contains

- Public evaluation input and result schemas.
- Risk profiler definition schemas.
- Questionnaire and answer validation helpers.
- Profile, allocation, and applicant-related types.

## Related Packages

- `@vibedcoder/invespro-core` runs evaluations.
- `@vibedcoder/invespro-hono` exposes the engine through a Hono REST adapter.
- `@vibedcoder/invespro-cli` provides command-line evaluation and validation.

See the main project documentation at [github.com/vibedcoder/invespro](https://github.com/vibedcoder/invespro).
