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
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';
import { createRiskProfilerApp } from '@vibedcoder/invespro-hono';

const engine = new RiskProfilerEngine();
const app = createRiskProfilerApp({ engine });

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
    "investmentHorizonYears": 10,
    "riskAttitude": "hold",
    "investmentObjective": "balanced_growth",
    "annualIncome": 75000,
    "dtiRatio": 20,
    "liquidityMonths": 4,
    "investmentExperience": "intermediate"
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
        "investmentHorizonYears": 10,
        "riskAttitude": "hold",
        "investmentObjective": "balanced_growth",
        "annualIncome": 75000,
        "dtiRatio": 20,
        "liquidityMonths": 4,
        "investmentExperience": "intermediate"
      }
    }
  ]
}
```

### `POST /evaluate/batch/csv`

Evaluates multiple applicants from a raw CSV request body and returns the same
JSON batch result shape as `POST /evaluate/batch`.

```csv
applicantId,investmentHorizonYears,riskAttitude,investmentObjective,annualIncome,dtiRatio,liquidityMonths,investmentExperience
APP-001,10,hold,balanced_growth,75000,20,4,intermediate
```

CSV columns should use the active definition's question IDs. `applicantId` is
optional.

## Custom Engine

```ts
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';
import { createRiskProfilerApp } from '@vibedcoder/invespro-hono';

const engine = new RiskProfilerEngine({ definition: customDefinition });
const app = createRiskProfilerApp({ engine });
```

## Related Packages

- `@vibedcoder/invespro-core` runs the actual evaluations.
- `@vibedcoder/invespro-types` provides request and result schemas.
- `@vibedcoder/invespro-cli` offers command-line workflows.

See the main project documentation at [github.com/vibedcoder/invespro](https://github.com/vibedcoder/invespro).
