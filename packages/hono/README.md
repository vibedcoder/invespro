# @vibedcoder/invespro-hono

Hono REST adapter for Invespro, a rules-based investment profiling and portfolio allocation engine.

Use this package when another service needs to call Invespro over HTTP instead of importing the core engine directly.

## Installation

```sh
pnpm add @vibedcoder/invespro-hono hono
```

```sh
npm install @vibedcoder/invespro-hono hono
```

## Quick Start

```ts
import { serve } from '@hono/node-server';
import { createRiskProfilerApp } from '@vibedcoder/invespro-hono';

const app = await createRiskProfilerApp();

serve({
  fetch: app.fetch,
  port: 3000,
});
```

## Endpoints

### `GET /health`

Returns service health.

### `GET /questions`

Returns the active questionnaire metadata.

### `POST /evaluate`

Evaluates one applicant.

```json
{
  "applicantId": "APP-001",
  "answers": {
    "age": 34,
    "investmentHorizon": "fiveToTenYears",
    "riskTolerance": "moderate",
    "objective": "balancedGrowth",
    "experience": "some",
    "liquidityNeeds": "medium"
  }
}
```

### `POST /evaluate/batch`

Evaluates multiple applicants in one request.

```json
{
  "items": [
    {
      "applicantId": "APP-001",
      "answers": {
        "age": 34,
        "investmentHorizon": "fiveToTenYears",
        "riskTolerance": "moderate",
        "objective": "balancedGrowth",
        "experience": "some",
        "liquidityNeeds": "medium"
      }
    }
  ]
}
```

## Custom Engine

```ts
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';
import { createRiskProfilerApp } from '@vibedcoder/invespro-hono';

const engine = await RiskProfilerEngine.create({ definition: customDefinition });
const app = await createRiskProfilerApp({ engine });
```

## Related Packages

- `@vibedcoder/invespro-core` runs the actual evaluations.
- `@vibedcoder/invespro-types` provides request and result schemas.
- `@vibedcoder/invespro-cli` offers command-line workflows.

See the main project documentation at [github.com/vibedcoder/invespro](https://github.com/vibedcoder/invespro).
