---
"@vibedcoder/invespro-core": minor
"@vibedcoder/invespro-hono": minor
"@vibedcoder/invespro-cli": patch
---

Add shared definition-aware CSV batch parsing in core and expose CSV batch evaluation through the Hono REST adapter.

The CLI now uses the shared parser, while the Hono adapter accepts raw CSV at `POST /evaluate/batch/csv` and returns the existing JSON batch result shape.
