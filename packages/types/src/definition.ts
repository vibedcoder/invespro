import * as z from 'zod';
import { AssetAllocationSchema, RiskBandSchema } from './profile.js';

export const DefinitionQuestionTypeSchema = z.enum(['select', 'number']);
export type DefinitionQuestionType = z.infer<typeof DefinitionQuestionTypeSchema>;

export const DefinitionQuestionOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  hint: z.string().optional(),
});
export type DefinitionQuestionOption = z.infer<typeof DefinitionQuestionOptionSchema>;

export const DefinitionQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  hint: z.string().optional(),
  type: DefinitionQuestionTypeSchema,
  options: z.array(DefinitionQuestionOptionSchema).optional(),
  unit: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});
export type DefinitionQuestion = z.infer<typeof DefinitionQuestionSchema>;

export const DefinitionScoreRuleSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('option'),
    value: z.union([z.string(), z.number()]),
    score: z.number().int().nonnegative(),
  }),
  z.object({
    type: z.literal('range'),
    min: z.number().optional(),
    max: z.number().optional(),
    includeMin: z.boolean().default(true),
    includeMax: z.boolean().default(false),
    score: z.number().int().nonnegative(),
  }),
]);
export type DefinitionScoreRule = z.infer<typeof DefinitionScoreRuleSchema>;

export const DefinitionScoringFactorSchema = z.object({
  questionId: z.string().min(1),
  weight: z.number().positive().default(1),
  rules: z.array(DefinitionScoreRuleSchema).min(1),
});
export type DefinitionScoringFactor = z.infer<typeof DefinitionScoringFactorSchema>;

export const DefinitionScoreBandSchema = z.object({
  riskProfile: RiskBandSchema,
  minScore: z.number().int().nonnegative(),
  maxScore: z.number().int().nonnegative(),
});
export type DefinitionScoreBand = z.infer<typeof DefinitionScoreBandSchema>;

export const DefinitionOverrideOperatorSchema = z.enum(['<', '<=', '>', '>=', '==', '!=']);
export type DefinitionOverrideOperator = z.infer<typeof DefinitionOverrideOperatorSchema>;

export const DefinitionOverrideSchema = z.object({
  id: z.string().min(1),
  description: z.string().optional(),
  questionId: z.string().min(1),
  operator: DefinitionOverrideOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
  riskProfile: RiskBandSchema,
});
export type DefinitionOverride = z.infer<typeof DefinitionOverrideSchema>;

export const RiskProfileDefinitionSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    id: z.string().min(1),
    name: z.string().min(1),
    version: z.string().min(1),
    currency: z.string().length(3).optional(),
    questions: z.array(DefinitionQuestionSchema).min(1),
    scoring: z.array(DefinitionScoringFactorSchema).min(1),
    scoreBands: z.array(DefinitionScoreBandSchema).min(1),
    allocations: z.record(RiskBandSchema, AssetAllocationSchema),
    overrides: z.array(DefinitionOverrideSchema).default([]),
  })
  .superRefine((definition, ctx) => {
    const questionIds = new Set<string>();
    definition.questions.forEach((question, index) => {
      if (questionIds.has(question.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate question id: "${question.id}".`,
          path: ['questions', index, 'id'],
        });
      }
      questionIds.add(question.id);

      if (question.type === 'select' && (question.options?.length ?? 0) === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Select questions must define at least one option.',
          path: ['questions', index, 'options'],
        });
      }

      if (
        question.min !== undefined &&
        question.max !== undefined &&
        question.min > question.max
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Question minimum cannot exceed its maximum.',
          path: ['questions', index],
        });
      }
    });

    const scoredQuestionIds = new Set<string>();
    definition.scoring.forEach((factor, factorIndex) => {
      if (!questionIds.has(factor.questionId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Unknown scoring question id: "${factor.questionId}".`,
          path: ['scoring', factorIndex, 'questionId'],
        });
      }
      if (scoredQuestionIds.has(factor.questionId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate scoring factor: "${factor.questionId}".`,
          path: ['scoring', factorIndex, 'questionId'],
        });
      }
      scoredQuestionIds.add(factor.questionId);

      factor.rules.forEach((rule, ruleIndex) => {
        if (rule.type !== 'range') return;

        if (rule.min === undefined && rule.max === undefined) {
          ctx.addIssue({
            code: 'custom',
            message: 'Range rules must define a minimum, maximum, or both.',
            path: ['scoring', factorIndex, 'rules', ruleIndex],
          });
        } else if (
          rule.min !== undefined &&
          rule.max !== undefined &&
          rule.min > rule.max
        ) {
          ctx.addIssue({
            code: 'custom',
            message: 'Range minimum cannot exceed its maximum.',
            path: ['scoring', factorIndex, 'rules', ruleIndex],
          });
        }
      });
    });

    const sortedBands = [...definition.scoreBands].sort(
      (left, right) => left.minScore - right.minScore,
    );
    sortedBands.forEach((band, index) => {
      if (band.minScore > band.maxScore) {
        ctx.addIssue({
          code: 'custom',
          message: 'Score band minimum cannot exceed its maximum.',
          path: ['scoreBands'],
        });
      }

      const previous = sortedBands[index - 1];
      if (previous !== undefined && band.minScore <= previous.maxScore) {
        ctx.addIssue({
          code: 'custom',
          message: 'Score bands cannot overlap.',
          path: ['scoreBands'],
        });
      }
    });

    for (const [riskProfile, allocation] of Object.entries(definition.allocations)) {
      const total =
        allocation.equities +
        allocation.fixedIncome +
        allocation.cash +
        allocation.alternatives;
      if (total !== 100) {
        ctx.addIssue({
          code: 'custom',
          message: `${riskProfile} allocation must total 100%.`,
          path: ['allocations', riskProfile],
        });
      }
    }

    definition.overrides.forEach((override, index) => {
      if (!questionIds.has(override.questionId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Unknown override question id: "${override.questionId}".`,
          path: ['overrides', index, 'questionId'],
        });
      }
    });
  });
export type RiskProfileDefinitionInput = z.input<typeof RiskProfileDefinitionSchema>;
export type RiskProfileDefinition = z.infer<typeof RiskProfileDefinitionSchema>;
