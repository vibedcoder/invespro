import * as z from 'zod';
import type {
  AnswerValue,
  EvaluationResult,
  RiskProfileAnswers,
  RiskProfileDefinition,
  RiskProfileEvaluationInput,
} from '@vibedcoder/invespro-types';
import { scoreField, toSnakeCase } from './compiler.js';

const ModernJdmResultSchema = z.object({
  profile_id: z.string(),
  raw_score: z.number().nonnegative(),
  normalized_score: z.number().min(0).max(100),
  override_applied: z.boolean().optional(),
  override_id: z.string().optional(),
}).passthrough();

const LegacyJdmResultSchema = z.object({
  risk_profile: z.string(),
  total_score: z.number().nonnegative().optional(),
  override_applied: z.boolean().optional(),
}).passthrough();

interface ParsedInput {
  readonly applicantId?: string;
  readonly answers: RiskProfileAnswers;
}

/**
 * Validates either the definition-driven input envelope or the legacy flat input.
 */
export function parseEvaluationInput(
  definition: RiskProfileDefinition,
  input: RiskProfileEvaluationInput | Record<string, unknown>,
): ParsedInput {
  const candidate = normalizeInputEnvelope(input);
  const answers = createAnswersSchema(definition).parse(
    candidate.answers,
  ) as RiskProfileAnswers;
  return {
    ...(candidate.applicantId !== undefined && {
      applicantId: candidate.applicantId,
    }),
    answers,
  };
}

/**
 * Maps public answer IDs to the field names used by generated JDM graphs.
 */
export function toJdmInput(answers: RiskProfileAnswers): Record<string, AnswerValue> {
  return Object.fromEntries(
    Object.entries(answers).map(([key, value]) => [toSnakeCase(key), value]),
  );
}

/**
 * Validates a standard-contract JDM response and enriches it with domain metadata.
 */
export function fromJdmResult(
  raw: unknown,
  definition: RiskProfileDefinition,
  graphChecksum: string,
  applicantId?: string,
): EvaluationResult {
  const modern = ModernJdmResultSchema.safeParse(raw);
  const parsed = modern.success
    ? {
        profileId: modern.data.profile_id,
        rawScore: modern.data.raw_score,
        normalizedScore: modern.data.normalized_score,
        overrideApplied: modern.data.override_applied ?? false,
        overrideId: modern.data.override_id,
        context: modern.data,
      }
    : parseLegacyResult(raw, definition);

  const profile = definition.profiles.find(
    (candidate) => candidate.id === parsed.profileId,
  );
  if (profile === undefined) {
    throw new Error(
      `[invespro-core] JDM returned undeclared profile id "${parsed.profileId}".`,
    );
  }

  const allocation = definition.allocations[profile.id];
  if (allocation === undefined) {
    throw new Error(
      `[invespro-core] No allocation is declared for profile "${profile.id}".`,
    );
  }

  const scores = Object.fromEntries(
    definition.scoring.flatMap((factor) => {
      const value = parsed.context[scoreField(factor.questionId)];
      return typeof value === 'number' ? [[factor.questionId, value]] : [];
    }),
  );
  const normalizedScore = roundScore(parsed.normalizedScore);

  return {
    ...(applicantId !== undefined && { applicantId }),
    ...(Object.keys(scores).length === definition.scoring.length && { scores }),
    rawScore: parsed.rawScore,
    normalizedScore,
    profile: {
      id: profile.id,
      label: profile.label,
      ...(profile.description !== undefined && {
        description: profile.description,
      }),
    },
    overrideApplied: parsed.overrideApplied,
    ...(parsed.overrideId !== undefined && { overrideId: parsed.overrideId }),
    allocation,
    evaluatedAt: new Date().toISOString(),
    definition: {
      id: definition.id,
      version: definition.version,
      schemaVersion: definition.schemaVersion,
      graphChecksum,
    },
    // Preserve the original result fields while consumers migrate.
    totalScore: parsed.rawScore,
    riskProfile: profile.label,
    jdmVersion: definition.version,
  };
}

function createAnswersSchema(
  definition: RiskProfileDefinition,
): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {};
  for (const question of definition.questions) {
    let schema: z.ZodType;
    if (question.type === 'number') {
      let numberSchema = z.number();
      if (question.min !== undefined) numberSchema = numberSchema.min(question.min);
      if (question.max !== undefined) numberSchema = numberSchema.max(question.max);
      schema = numberSchema;
    } else if (question.type === 'boolean') {
      schema = z.boolean();
    } else {
      const values = question.options?.map((option) => option.value) ?? [];
      schema = z
        .union([z.string(), z.number(), z.boolean()])
        .refine(
          (value) => values.some((candidate) => Object.is(candidate, value)),
          `Expected one of the declared options for "${question.id}".`,
        );
    }
    shape[question.id] = question.required ? schema : schema.optional();
  }
  return z.object(shape).strict();
}

function normalizeInputEnvelope(
  input: RiskProfileEvaluationInput | Record<string, unknown>,
): { applicantId?: string; answers: Record<string, unknown> } {
  if (
    'answers' in input &&
    typeof input.answers === 'object' &&
    input.answers !== null &&
    !Array.isArray(input.answers)
  ) {
    const applicantId =
      typeof input.applicantId === 'string' ? input.applicantId : undefined;
    return {
      ...(applicantId !== undefined && { applicantId }),
      answers: input.answers as Record<string, unknown>,
    };
  }

  const { applicantId, ...answers } = input;
  return {
    ...(typeof applicantId === 'string' && { applicantId }),
    answers,
  };
}

function parseLegacyResult(
  raw: unknown,
  definition: RiskProfileDefinition,
): {
  profileId: string;
  rawScore: number;
  normalizedScore: number;
  overrideApplied: boolean;
  overrideId?: string;
  context: Record<string, unknown>;
} {
  const legacy = LegacyJdmResultSchema.safeParse(raw);
  if (!legacy.success) {
    throw new Error(
      `[invespro-core] JDM output does not satisfy the Invespro graph contract.\n${legacy.error.message}`,
    );
  }
  const profile = definition.profiles.find(
    (candidate) => candidate.label === legacy.data.risk_profile,
  );
  if (profile === undefined) {
    throw new Error(
      `[invespro-core] Legacy JDM returned unknown profile "${legacy.data.risk_profile}".`,
    );
  }
  if (legacy.data.total_score === undefined) {
    if (!(legacy.data.override_applied ?? false)) {
      throw new Error(
        '[invespro-core] A non-override legacy result requires "total_score".',
      );
    }
  }

  const rawScore = legacy.data.total_score ?? 0;
  const maximumRawScore = definition.scoring.reduce(
    (sum, factor) => sum + Math.max(...factor.rules.map((rule) => rule.score)),
    0,
  );
  return {
    profileId: profile.id,
    rawScore,
    normalizedScore: maximumRawScore === 0 ? 0 : (rawScore / maximumRawScore) * 100,
    overrideApplied: legacy.data.override_applied ?? false,
    context: legacy.data,
  };
}

function roundScore(score: number): number {
  return Math.round((score + Number.EPSILON) * 100) / 100;
}
