import { Hono } from 'hono';
import type { Context } from 'hono';
import * as z from 'zod';
import {
  parseCsvBatch,
  RiskProfilerEngine,
} from '@zagvar/helm-core';
import {
  RiskProfileBatchEvaluationInputSchema,
  RiskProfileDefinitionSchema,
} from '@zagvar/helm-types';
import type { RiskProfileDefinitionInput } from '@zagvar/helm-types';

export interface RiskProfilerServiceOptions {
  readonly engine?: RiskProfilerEngine;
  readonly definition?: RiskProfileDefinitionInput;
  readonly maxBatchSize?: number;
}

export interface RiskProfilerService {
  readonly app: Hono;
  readonly engine: RiskProfilerEngine;
  dispose(): void;
}

export interface CreateRiskProfilerAppOptions {
  readonly engine: RiskProfilerEngine;
  readonly maxBatchSize?: number;
}

export interface ApiError {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

/**
 * Creates a Hono adapter and owns its engine unless one is supplied.
 *
 * Call `dispose()` from the host application's shutdown hook.
 */
export function createRiskProfilerService(
  options: RiskProfilerServiceOptions = {},
): RiskProfilerService {
  const ownsEngine = options.engine === undefined;
  const engine =
    options.engine ??
    new RiskProfilerEngine({
      ...(options.definition !== undefined && {
        definition: options.definition,
      }),
    });
  return {
    app: createRoutes(engine, {
      ...(options.maxBatchSize !== undefined && {
        maxBatchSize: options.maxBatchSize,
      }),
    }),
    engine,
    dispose(): void {
      if (ownsEngine) engine.dispose();
    },
  };
}

/**
 * Creates routes around an engine whose lifecycle is owned by the caller.
 */
export function createRiskProfilerApp(
  options: CreateRiskProfilerAppOptions,
): Hono {
  return createRoutes(options.engine, {
    ...(options.maxBatchSize !== undefined && {
      maxBatchSize: options.maxBatchSize,
    }),
  });
}

function createRoutes(
  engine: RiskProfilerEngine,
  options: { maxBatchSize?: number } = {},
): Hono {
  const app = new Hono();
  const maxBatchSize = options.maxBatchSize ?? 100;

  app.get('/health', (c) => c.json({ status: 'ok' }));
  app.get('/definition', (c) => c.json(engine.definition));
  app.get('/questions', (c) => c.json(engine.definition.questions));

  app.post('/definitions/validate', async (c) => {
    const body = await readJson(c);
    if (!body.ok) return c.json(body.error, 400);

    const result = RiskProfileDefinitionSchema.safeParse(body.value);
    if (!result.success) {
      return c.json(
        validationError('Invalid risk profile definition.', result.error.flatten()),
        422,
      );
    }
    return c.json({ valid: true, definition: result.data });
  });

  app.post('/evaluate', async (c) => {
    const body = await readJson(c);
    if (!body.ok) return c.json(body.error, 400);
    if (typeof body.value !== 'object' || body.value === null) {
      return c.json(validationError('Evaluation input must be a JSON object.'), 422);
    }

    try {
      return c.json(
        await engine.evaluate(body.value as Record<string, unknown>),
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          validationError('Invalid evaluation input.', error.flatten()),
          422,
        );
      }
      return c.json(
        serverError(
          error instanceof Error ? error.message : 'Evaluation failed.',
        ),
        500,
      );
    }
  });

  app.post('/evaluate/batch', async (c) => {
    const body = await readJson(c);
    if (!body.ok) return c.json(body.error, 400);

    const batch = RiskProfileBatchEvaluationInputSchema.safeParse(body.value);
    if (!batch.success) {
      return c.json(
        validationError('Invalid batch evaluation input.', batch.error.flatten()),
        422,
      );
    }
    if (batch.data.items.length > maxBatchSize) {
      return c.json(
        validationError(
          `Batch size ${batch.data.items.length} exceeds the maximum of ${maxBatchSize}.`,
        ),
        422,
      );
    }

    try {
      return c.json(
        await engine.evaluateMany(batch.data, {
          maxBatchSize,
        }),
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          validationError('Invalid evaluation input.', error.flatten()),
          422,
        );
      }
      return c.json(
        serverError(
          error instanceof Error ? error.message : 'Batch evaluation failed.',
        ),
        500,
      );
    }
  });

  app.post('/evaluate/batch/csv', async (c) => {
    const body = await readText(c);
    if (!body.ok) return c.json(body.error, 400);

    let items: Record<string, unknown>[];
    try {
      items = parseCsvBatch(body.value, engine.definition);
    } catch (error) {
      return c.json(
        validationError(
          error instanceof Error ? error.message : 'Invalid CSV batch input.',
        ),
        400,
      );
    }

    if (items.length === 0) {
      return c.json(validationError('CSV batch input must contain at least one row.'), 422);
    }
    if (items.length > maxBatchSize) {
      return c.json(
        validationError(
          `Batch size ${items.length} exceeds the maximum of ${maxBatchSize}.`,
        ),
        422,
      );
    }

    try {
      return c.json(
        await engine.evaluateMany(
          {
            items,
          },
          {
            maxBatchSize,
          },
        ),
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          validationError('Invalid evaluation input.', error.flatten()),
          422,
        );
      }
      return c.json(
        serverError(
          error instanceof Error ? error.message : 'CSV batch evaluation failed.',
        ),
        500,
      );
    }
  });

  return app;
}

async function readJson(
  c: Context,
): Promise<{ ok: true; value: unknown } | { ok: false; error: ApiError }> {
  try {
    return { ok: true, value: await c.req.json() };
  } catch {
    return {
      ok: false,
      error: {
        error: {
          code: 'invalid_json',
          message: 'Request body must be valid JSON.',
        },
      },
    };
  }
}

async function readText(
  c: Context,
): Promise<{ ok: true; value: string } | { ok: false; error: ApiError }> {
  try {
    return { ok: true, value: await c.req.text() };
  } catch {
    return {
      ok: false,
      error: {
        error: {
          code: 'invalid_text',
          message: 'Request body must be valid text.',
        },
      },
    };
  }
}

function validationError(message: string, details?: unknown): ApiError {
  return {
    error: {
      code: 'validation_error',
      message,
      ...(details !== undefined && { details }),
    },
  };
}

function serverError(message: string): ApiError {
  return {
    error: {
      code: 'evaluation_error',
      message,
    },
  };
}
