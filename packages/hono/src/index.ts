import { Hono } from 'hono';
import type { Context } from 'hono';
import {
  DEFAULT_RISK_PROFILE_DEFINITION,
  RiskProfilerEngine,
} from '@vibedcoder/invespro-core';
import {
  ApplicantInputSchema,
  RiskProfileDefinitionSchema,
} from '@vibedcoder/invespro-types';
import type { EvaluationResult } from '@vibedcoder/invespro-types';

export interface CreateRiskProfilerAppOptions {
  readonly engine?: RiskProfilerEngine;
}

export interface ApiError {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

export function createRiskProfilerApp(options: CreateRiskProfilerAppOptions = {}): Hono {
  const app = new Hono();
  const engine = options.engine ?? new RiskProfilerEngine();

  app.get('/health', (c) => c.json({ status: 'ok' }));

  app.get('/definition', (c) => c.json(DEFAULT_RISK_PROFILE_DEFINITION));

  app.get('/questions', (c) => c.json(DEFAULT_RISK_PROFILE_DEFINITION.questions));

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

    const input = ApplicantInputSchema.safeParse(body.value);
    if (!input.success) {
      return c.json(validationError('Invalid applicant input.', input.error.flatten()), 422);
    }

    try {
      const result: EvaluationResult = await engine.evaluate(input.data);
      return c.json(result);
    } catch (err) {
      return c.json(
        serverError(err instanceof Error ? err.message : 'Evaluation failed.'),
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

function validationError(message: string, details: unknown): ApiError {
  return {
    error: {
      code: 'validation_error',
      message,
      details,
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
