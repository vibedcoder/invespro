# @vibedcoder/invespro-cli

Command-line interface for Invespro, a rules-based investment profiling and portfolio allocation engine.

Use this package to evaluate JSON or CSV inputs, validate custom definitions, compile definitions to JDM, or run an interactive profiling flow.

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
    "age": 34,
    "investmentHorizon": "fiveToTenYears",
    "riskTolerance": "moderate",
    "objective": "balancedGrowth",
    "experience": "some",
    "liquidityNeeds": "medium"
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

## Interactive Profiling

```sh
invespro profile
```

## Custom Definitions

Validate a custom definition:

```sh
invespro validate definition.json
```

Compile a definition to a ZenEngine/Gorules JDM graph:

```sh
invespro compile definition.json --output graph.json
```

Evaluate with a custom definition:

```sh
invespro evaluate input.json --definition definition.json --output json
```

## Related Packages

- `@vibedcoder/invespro-core` runs the evaluation engine.
- `@vibedcoder/invespro-types` provides schemas and types.
- `@vibedcoder/invespro-hono` exposes the engine through REST.

See the main project documentation at [github.com/vibedcoder/invespro](https://github.com/vibedcoder/invespro).
