# @vibedcoder/invespro-types

Shared TypeScript types and Zod schemas for Invespro, a rules-based investment
profiling and portfolio allocation engine.

Use this package when you want to validate request payloads, custom definition
files, questionnaire answers, or evaluation results without depending on the
core ZenEngine runtime.

## Installation

```sh
pnpm add @vibedcoder/invespro-types
```

```sh
npm install @vibedcoder/invespro-types
```

## Usage

```ts
import {
  RiskProfileEvaluationInputSchema,
  RiskProfileDefinitionSchema,
} from '@vibedcoder/invespro-types';

const input = RiskProfileEvaluationInputSchema.parse({
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

const definition = RiskProfileDefinitionSchema.parse(customDefinition);
```

## What It Contains

- Public evaluation input and result schemas.
- Batch evaluation input and result schemas.
- Risk profile definition schemas.
- Questionnaire and answer validation types.
- Profile, allocation, and applicant-related types.

## Related Packages

- `@vibedcoder/invespro-core` runs evaluations.
- `@vibedcoder/invespro-hono` exposes the engine through a Hono REST adapter.
- `@vibedcoder/invespro-cli` provides command-line evaluation and validation.

Full documentation: [invespro.vercel.app](https://invespro.vercel.app/).
