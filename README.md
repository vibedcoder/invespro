# invespro

Open source investment risk profiling for Node.js services, REST APIs, and
command-line workflows. The default model is evaluated by
[ZEN Engine](https://gorules.io/zen/) and includes seven scored factors, five
risk bands, asset allocations, and a debt-to-income override.

## Packages

| Package | Description |
| --- | --- |
| `@vibedcoder/invespro-types` | Public Zod schemas and TypeScript contracts |
| `@vibedcoder/invespro-core` | ZEN-backed profiling engine and default definition |
| `@vibedcoder/invespro-hono` | Mountable Hono REST adapter |
| `@vibedcoder/invespro-cli` | Interactive and JSON-oriented CLI |

## Core

```ts
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';

const engine = new RiskProfilerEngine();

try {
  const result = await engine.evaluate({
    investmentHorizonYears: 10,
    riskAttitude: 'hold',
    investmentObjective: 'balanced_growth',
    annualIncome: 75_000,
    dtiRatio: 20,
    liquidityMonths: 4,
    investmentExperience: 'intermediate',
  });

  console.log(result);
} finally {
  engine.dispose();
}
```

## CLI

```bash
invespro profile
invespro evaluate applicant.json --output json
invespro evaluate applicant.json --definition model.json
invespro compile --definition model.json --output model.jdm.json
invespro validate model.jdm.json --definition model.json --input applicant.json
```

JSON mode writes the evaluation result to standard output for use in scripts
and pipelines.

## Hono

```ts
import { Hono } from 'hono';
import { createRiskProfilerService } from '@vibedcoder/invespro-hono';

const app = new Hono();
const profiler = createRiskProfilerService();
app.route('/risk-profiler', profiler.app);

// Call this from the host application's shutdown hook.
profiler.dispose();
```

The adapter exposes:

- `GET /health`
- `GET /definition`
- `GET /questions`
- `POST /evaluate`
- `POST /definitions/validate`

## Customization

`RiskProfileDefinitionSchema` describes questions, question purposes, scored
options and ranges, relative weights, normalized score bands, profiles, asset
classes, allocations, and override rules. The bundled default definition is
exported as `DEFAULT_RISK_PROFILE_DEFINITION`.

Supplying a definition without a graph compiles it into deterministic JDM:

```ts
const engine = new RiskProfilerEngine({ definition });
const result = await engine.evaluate({
  answers: {
    riskCapacity: 8,
    needsEmergencyAccess: false,
  },
});
```

The compiler normalizes each factor by its maximum score, applies relative
weights, and produces a final score from 0 to 100. Definition ID, version,
schema version, and generated graph checksum are included in every result.

Raw custom JDM remains available through a custom loader. Its internal nodes
may be arbitrary, but its input and output must conform to the supplied
definition contract. Question IDs are converted from lower camel case to snake
case at the JDM boundary (`riskCapacity` becomes `risk_capacity`). The graph
must return:

```json
{
  "profile_id": "moderate",
  "raw_score": 34,
  "normalized_score": 60.71,
  "override_applied": false
}
```

An override may additionally return `override_id`. Per-factor score fields use
the generated `<question_id>_score` snake-case convention and are included in
the public score breakdown when all factors are present.

Core rejects undeclared profile IDs and malformed results before adapters return
them to consumers.

## Development

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

The workspace uses pnpm, TypeScript project references, tsdown, Vitest, ESLint,
and Changesets.

## License

MIT - see [LICENSE](./LICENSE).
