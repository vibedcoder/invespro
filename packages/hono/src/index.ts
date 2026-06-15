import { Hono } from 'hono';
import type { Context } from 'hono';
import * as z from 'zod';
import { RiskProfilerEngine } from '@vibedcoder/invespro-core';
import { RiskProfileDefinitionSchema } from '@vibedcoder/invespro-types';
import type { RiskProfileDefinitionInput } from '@vibedcoder/invespro-types';

export interface RiskProfilerServiceOptions {
  readonly engine?: RiskProfilerEngine;
  readonly definition?: RiskProfileDefinitionInput;
}

export interface RiskProfilerService {
  readonly app: Hono;
  readonly engine: RiskProfilerEngine;
  dispose(): void;
}

export interface CreateRiskProfilerAppOptions {
  readonly engine: RiskProfilerEngine;
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
    app: createRoutes(engine),
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
  return createRoutes(options.engine);
}

function createRoutes(engine: RiskProfilerEngine): Hono {
  const app = new Hono();

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
