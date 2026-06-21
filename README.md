# invespro

Rules-based investment profiling and portfolio allocation for Node.js services,
REST APIs, and command-line workflows.

Invespro evaluates applicant answers against a versioned risk model and returns
a normalized score, risk profile, portfolio allocation, and definition metadata
for auditability. It ships with a default profiling model and supports custom
definitions when your questions, scoring, bands, overrides, or allocations need
to match a specific policy.

Learn more in the [documentation](https://invespro.vercel.app/docs), or
[try the interactive demo](https://invespro.vercel.app/demo).

> This project provides software primitives for investment profiling and
> allocation. It is not financial advice. Production users remain responsible
> for regulatory, suitability, audit, and disclosure requirements in their
> jurisdiction.

## Packages

| Package                      | Purpose                                                                  |
| ---------------------------- | ------------------------------------------------------------------------ |
| `@vibedcoder/invespro-core`  | Main engine, default definition, compiler, CSV parser, batch evaluation. |
| `@vibedcoder/invespro-hono`  | REST API adapter for Hono services.                                      |
| `@vibedcoder/invespro-cli`   | Command-line evaluation, validation, and compilation.                    |
| `@vibedcoder/invespro-types` | Shared Zod schemas and TypeScript types.                                 |

Use `core` when embedding profiling directly in a service, `hono` when another
system should call the engine over HTTP, `cli` for local or operational
workflows, and `types` when you only need validation contracts.

## Installation

Install only the package or packages your integration needs:

```bash
pnpm add @vibedcoder/invespro-core
pnpm add @vibedcoder/invespro-hono hono
pnpm add -D @vibedcoder/invespro-cli
pnpm add @vibedcoder/invespro-types
```

The workspace targets Node.js `>=24.0.0` and pnpm `>=11.0.0`.

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

The default model includes seven scored factors, five risk profiles, four asset
classes, and an override that assigns a conservative profile when debt-to-income
ratio is high. See
[Model Concepts](https://invespro.vercel.app/docs/model-concepts) for the full
model details.

## Common Workflows

### Core Engine

Use `RiskProfilerEngine` for direct evaluation from a Node.js service. It
supports single-applicant evaluation, ordered batch evaluation, CSV batch
parsing, default definitions, and custom definitions.

See the [core guide](https://invespro.vercel.app/docs/guides/core-engine).

### REST API

Mount the Hono adapter when another service should call Invespro over HTTP:

```ts
import { serve } from '@hono/node-server';
import { createRiskProfilerService } from '@vibedcoder/invespro-hono';

const service = createRiskProfilerService();

serve({
  fetch: service.app.fetch,
  port: 3000,
});
```

The adapter exposes health, definition, questions, validation, single
evaluation, JSON batch, and CSV batch endpoints.

See the [REST API guide](https://invespro.vercel.app/docs/guides/rest-api) and
[endpoint reference](https://invespro.vercel.app/docs/reference/rest-endpoints).

### CLI

Use the CLI for local evaluation, CSV workflows, definition compilation, and
JDM graph validation:

```bash
pnpm add --save-dev @vibedcoder/invespro-cli
pnpm exec invespro --help
pnpm exec invespro evaluate input.json --output json
pnpm exec invespro evaluate-batch applicants.csv --input-format csv --output csv
pnpm exec invespro compile definition.json --output graph.jdm.json
pnpm exec invespro validate graph.jdm.json --definition definition.json
```

See the [CLI guide](https://invespro.vercel.app/docs/guides/cli) and
[CLI reference](https://invespro.vercel.app/docs/reference/cli-reference).

### Custom Definitions

Invespro is definition-driven. A definition controls questions, scoring,
profiles, score bands, overrides, asset classes, and allocations. Expert users
can also supply custom JDM graphs when they follow the Invespro input and
result contract.

See the
[custom definitions guide](https://invespro.vercel.app/docs/guides/custom-definitions),
[definition schema reference](https://invespro.vercel.app/docs/reference/definition-schema),
and
[expert JDM contract](https://invespro.vercel.app/docs/reference/expert-jdm-contract).

## Development

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Useful docs commands:

```bash
pnpm docs:dev
pnpm docs:build
```

The workspace uses pnpm workspaces, TypeScript project references, tsdown,
Vitest, ESLint, and a Next.js docs app.

## License

MIT - see [LICENSE](./LICENSE).
