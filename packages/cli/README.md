# @vibedcoder/invespro-cli

Command-line interface for Invespro, a rules-based investment profiling and
portfolio allocation engine.

Use this package to evaluate JSON or CSV inputs, compile definitions to JDM,
validate JDM graphs, or run an interactive profiling flow.

## Installation

```sh
pnpm add -g @vibedcoder/invespro-cli
```

```sh
npm install -g @vibedcoder/invespro-cli
```

You can also run it without a global install:

```sh
npx @vibedcoder/invespro-cli --help
```

## Evaluate One Applicant

```sh
invespro evaluate input.json --output json
```

Example input:

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

## Batch Evaluation

JSON batch:

```sh
invespro evaluate-batch applicants.json --output json
```

CSV batch:

```sh
invespro evaluate-batch applicants.csv --input-format csv --output csv
```

Example CSV:

```csv
applicantId,investmentHorizonYears,riskAttitude,investmentObjective,annualIncome,dtiRatio,liquidityMonths,investmentExperience
APP-001,10,hold,balanced_growth,75000,20,4,intermediate
```

## Interactive Profiling

```sh
invespro profile
```

## Custom Definitions and JDM Graphs

Compile a definition to a ZenEngine/Gorules JDM graph:

```sh
invespro compile definition.json --output graph.json
```

Validate a JDM graph:

```sh
invespro validate graph.json
```

Validate a graph against a custom definition contract:

```sh
invespro validate graph.json --definition definition.json --input sample-input.json
```

Evaluate with a custom definition:

```sh
invespro evaluate input.json --definition definition.json --output json
```

## Related Packages

- `@vibedcoder/invespro-core` runs the evaluation engine.
- `@vibedcoder/invespro-types` provides schemas and types.
- `@vibedcoder/invespro-hono` exposes the engine through REST.

Full documentation: [invespro.vercel.app](https://invespro.vercel.app/).
