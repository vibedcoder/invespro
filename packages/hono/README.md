# @vibedcoder/invespro-hono

Hono REST adapter for Invespro, a rules-based investment profiling and
portfolio allocation engine.

Use this package when another service should call Invespro over HTTP instead of
importing the core engine directly.

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
import { createRiskProfilerService } from '@vibedcoder/invespro-hono';

const service = createRiskProfilerService();

serve({
  fetch: service.app.fetch,
  port: 3000,
});
```

If you already own the engine lifecycle, create routes around an existing
engine:

```ts
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';
import { createRiskProfilerApp } from '@vibedcoder/invespro-hono';

const engine = new RiskProfilerEngine();
const app = createRiskProfilerApp({ engine });
```

## Endpoints

### `GET /health`

Returns service health.

### `GET /definition`

Returns the active risk profile definition.

### `GET /questions`

Returns the active questionnaire metadata.

### `POST /definitions/validate`

Validates a custom risk profile definition.

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

Evaluates multiple applicants in one JSON request.

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

## Custom Definitions

```ts
import { createRiskProfilerService } from '@vibedcoder/invespro-hono';

const service = createRiskProfilerService({
  definition: customDefinition,
  maxBatchSize: 100,
});
```

## Related Packages

- `@vibedcoder/invespro-core` runs the actual evaluations.
- `@vibedcoder/invespro-types` provides request and result schemas.
- `@vibedcoder/invespro-cli` offers command-line workflows.

Full documentation: [invespro.vercel.app](https://invespro.vercel.app/).
