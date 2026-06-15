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
invespro validate custom-model.json
```

JSON mode writes the evaluation result to standard output for use in scripts
and pipelines.

## Hono

```ts
import { Hono } from 'hono';
import { createRiskProfilerApp } from '@vibedcoder/invespro-hono';

const app = new Hono();
app.route('/risk-profiler', createRiskProfilerApp());
```

The adapter exposes:

- `GET /health`
- `GET /definition`
- `GET /questions`
- `POST /evaluate`
- `POST /definitions/validate`

## Customization

`RiskProfileDefinitionSchema` describes questions, scored options and ranges,
weights, score bands, allocations, and override rules. The bundled default
definition is exported as `DEFAULT_RISK_PROFILE_DEFINITION`.

Definition validation is available now. Compilation of arbitrary definitions
into executable JDM graphs is planned as the next implementation phase. Raw
custom JDM graphs remain supported through a custom core loader or the CLI
`--jdm-path` option.

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
