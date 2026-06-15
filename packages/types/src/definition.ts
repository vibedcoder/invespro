import * as z from 'zod';

const IdentifierSchema = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9]*$/, 'Expected a lower camelCase identifier.');

export const AnswerValueSchema = z.union([z.string(), z.number(), z.boolean()]);
export type AnswerValue = z.infer<typeof AnswerValueSchema>;

export const QuestionPurposeSchema = z.enum([
  'scored',
  'informational',
  'override',
]);
export type QuestionPurpose = z.infer<typeof QuestionPurposeSchema>;

export const DefinitionQuestionTypeSchema = z.enum(['select', 'number', 'boolean']);
export type DefinitionQuestionType = z.infer<typeof DefinitionQuestionTypeSchema>;

export const DefinitionQuestionOptionSchema = z.object({
  label: z.string().min(1),
  value: AnswerValueSchema,
  hint: z.string().optional(),
});
export type DefinitionQuestionOption = z.infer<typeof DefinitionQuestionOptionSchema>;

export const DefinitionQuestionSchema = z.object({
  id: IdentifierSchema,
  text: z.string().min(1),
  purpose: QuestionPurposeSchema.default('scored'),
  required: z.boolean().default(true),
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
    value: AnswerValueSchema,
    score: z.number().nonnegative(),
  }),
  z.object({
    type: z.literal('range'),
    min: z.number().optional(),
    max: z.number().optional(),
    includeMin: z.boolean().default(true),
    includeMax: z.boolean().default(false),
    score: z.number().nonnegative(),
  }),
]);
export type DefinitionScoreRule = z.infer<typeof DefinitionScoreRuleSchema>;

export const DefinitionScoringFactorSchema = z.object({
  questionId: IdentifierSchema,
  weight: z.number().positive().max(100).default(1),
  rules: z.array(DefinitionScoreRuleSchema).min(1),
});
export type DefinitionScoringFactor = z.infer<typeof DefinitionScoringFactorSchema>;

export const DefinitionProfileSchema = z.object({
  id: IdentifierSchema,
  label: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().nonnegative(),
});
export type DefinitionProfile = z.infer<typeof DefinitionProfileSchema>;

export const DefinitionScoreBandSchema = z.object({
  profileId: IdentifierSchema,
  minScore: z.number().min(0).max(100),
});
export type DefinitionScoreBand = z.infer<typeof DefinitionScoreBandSchema>;

export const DefinitionAssetClassSchema = z.object({
  id: IdentifierSchema,
  label: z.string().min(1),
  description: z.string().optional(),
});
export type DefinitionAssetClass = z.infer<typeof DefinitionAssetClassSchema>;

export const DefinitionOverrideOperatorSchema = z.enum(['<', '<=', '>', '>=', '==', '!=']);
export type DefinitionOverrideOperator = z.infer<typeof DefinitionOverrideOperatorSchema>;

export const DefinitionOverrideSchema = z.object({
  id: IdentifierSchema,
  description: z.string().optional(),
  questionId: IdentifierSchema,
  operator: DefinitionOverrideOperatorSchema,
  value: AnswerValueSchema,
  profileId: IdentifierSchema,
});
export type DefinitionOverride = z.infer<typeof DefinitionOverrideSchema>;

/**
 * Validates the complete, executable investment-risk model contract.
 *
 * Cross-field validation ensures scoring, profiles, bands, allocations, and
 * overrides reference declared identifiers consistently.
 */
export const RiskProfileDefinitionSchema = z
  .object({
    schemaVersion: z.literal('1.0'),
    id: IdentifierSchema,
    name: z.string().min(1),
    version: z
      .string()
      .regex(
        /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
        'Expected a semantic version.',
      ),
    currency: z.string().length(3).optional(),
    questions: z.array(DefinitionQuestionSchema).min(1),
    scoring: z.array(DefinitionScoringFactorSchema).min(1),
    profiles: z.array(DefinitionProfileSchema).min(2),
    scoreBands: z.array(DefinitionScoreBandSchema).min(2),
    assetClasses: z.array(DefinitionAssetClassSchema).min(1),
    allocations: z.record(IdentifierSchema, z.record(IdentifierSchema, z.number().min(0).max(100))),
    overrides: z.array(DefinitionOverrideSchema).default([]),
  })
  .superRefine((definition, ctx) => {
    const questionsById = collectUnique(
      definition.questions,
      'questions',
      ctx,
    );
    const profilesById = collectUnique(definition.profiles, 'profiles', ctx);
    const assetClassesById = collectUnique(
      definition.assetClasses,
      'assetClasses',
      ctx,
    );

    definition.questions.forEach((question, index) => {
      if (question.type === 'select' && (question.options?.length ?? 0) === 0) {
        addIssue(ctx, ['questions', index, 'options'], 'Select questions require options.');
      }
      if (question.type !== 'select' && question.options !== undefined) {
        addIssue(ctx, ['questions', index, 'options'], 'Only select questions may define options.');
      }
      if (
        question.min !== undefined &&
        question.max !== undefined &&
        question.min > question.max
      ) {
        addIssue(ctx, ['questions', index], 'Question minimum cannot exceed its maximum.');
      }
    });

    const scoredQuestionIds = new Set<string>();
    definition.scoring.forEach((factor, factorIndex) => {
      const question = questionsById.get(factor.questionId);
      if (question === undefined) {
        addIssue(
          ctx,
          ['scoring', factorIndex, 'questionId'],
          `Unknown question id: "${factor.questionId}".`,
        );
        return;
      }
      if (question.purpose !== 'scored') {
        addIssue(
          ctx,
          ['scoring', factorIndex, 'questionId'],
          `Question "${factor.questionId}" is not marked as scored.`,
        );
      }
      if (!question.required) {
        addIssue(
          ctx,
          ['questions', definition.questions.indexOf(question), 'required'],
          `Scored question "${question.id}" must be required.`,
        );
      }
      if (scoredQuestionIds.has(factor.questionId)) {
        addIssue(
          ctx,
          ['scoring', factorIndex, 'questionId'],
          `Duplicate scoring factor: "${factor.questionId}".`,
        );
      }
      scoredQuestionIds.add(factor.questionId);

      factor.rules.forEach((rule, ruleIndex) => {
        if (rule.type === 'range') {
          if (question.type !== 'number') {
            addIssue(
              ctx,
              ['scoring', factorIndex, 'rules', ruleIndex],
              'Range rules require a number question.',
            );
          }
          if (rule.min === undefined && rule.max === undefined) {
            addIssue(
              ctx,
              ['scoring', factorIndex, 'rules', ruleIndex],
              'Range rules require a minimum, maximum, or both.',
            );
          }
          if (
            rule.min !== undefined &&
            rule.max !== undefined &&
            rule.min > rule.max
          ) {
            addIssue(
              ctx,
              ['scoring', factorIndex, 'rules', ruleIndex],
              'Range minimum cannot exceed its maximum.',
            );
          }
        } else if (!valueMatchesQuestion(rule.value, question)) {
          addIssue(
            ctx,
            ['scoring', factorIndex, 'rules', ruleIndex, 'value'],
            `Score value does not match question "${question.id}".`,
          );
        }
      });
      if (question.type === 'select') {
        const scoredValues = factor.rules
          .filter((rule) => rule.type === 'option')
          .map((rule) => typedValueKey(rule.value));
        const uniqueScoredValues = new Set(scoredValues);
        if (uniqueScoredValues.size !== scoredValues.length) {
          addIssue(
            ctx,
            ['scoring', factorIndex, 'rules'],
            `Question "${question.id}" has duplicate option scores.`,
          );
        }
        const declaredValues = new Set(
          (question.options ?? []).map((option) => typedValueKey(option.value)),
        );
        for (const scoredValue of uniqueScoredValues) {
          if (!declaredValues.has(scoredValue)) {
            addIssue(
              ctx,
              ['scoring', factorIndex, 'rules'],
              `Question "${question.id}" scores an undeclared option.`,
            );
          }
        }
        for (const option of question.options ?? []) {
          if (!uniqueScoredValues.has(typedValueKey(option.value))) {
            addIssue(
              ctx,
              ['scoring', factorIndex, 'rules'],
              `Option "${option.label}" requires a score.`,
            );
          }
        }
      } else if (question.type === 'boolean') {
        const scoredValues = new Set(
          factor.rules
            .filter((rule) => rule.type === 'option')
            .map((rule) => typedValueKey(rule.value)),
        );
        if (!scoredValues.has('boolean:true') || !scoredValues.has('boolean:false')) {
          addIssue(
            ctx,
            ['scoring', factorIndex, 'rules'],
            `Boolean question "${question.id}" must score true and false.`,
          );
        }
      } else {
        validateRangeCoverage(factor.rules, factorIndex, ctx);
      }
      if (Math.max(...factor.rules.map((rule) => rule.score)) <= 0) {
        addIssue(
          ctx,
          ['scoring', factorIndex, 'rules'],
          'A scored factor requires at least one positive score.',
        );
      }
    });

    definition.questions.forEach((question, index) => {
      if (question.purpose === 'scored' && !scoredQuestionIds.has(question.id)) {
        addIssue(
          ctx,
          ['questions', index, 'purpose'],
          `Scored question "${question.id}" requires a scoring factor.`,
        );
      }
    });

    const profileOrders = new Set<number>();
    definition.profiles.forEach((profile, index) => {
      if (profileOrders.has(profile.order)) {
        addIssue(ctx, ['profiles', index, 'order'], `Duplicate profile order: ${profile.order}.`);
      }
      profileOrders.add(profile.order);
    });

    const bandProfileIds = new Set<string>();
    const bandMinimums = new Set<number>();
    definition.scoreBands.forEach((band, index) => {
      if (!profilesById.has(band.profileId)) {
        addIssue(
          ctx,
          ['scoreBands', index, 'profileId'],
          `Unknown profile id: "${band.profileId}".`,
        );
      }
      if (bandProfileIds.has(band.profileId)) {
        addIssue(
          ctx,
          ['scoreBands', index, 'profileId'],
          `Duplicate score band for profile "${band.profileId}".`,
        );
      }
      if (bandMinimums.has(band.minScore)) {
        addIssue(
          ctx,
          ['scoreBands', index, 'minScore'],
          `Duplicate score band minimum: ${band.minScore}.`,
        );
      }
      bandProfileIds.add(band.profileId);
      bandMinimums.add(band.minScore);
    });
    if (!bandMinimums.has(0)) {
      addIssue(ctx, ['scoreBands'], 'Score bands must include a minimum score of 0.');
    }
    for (const profile of definition.profiles) {
      if (!bandProfileIds.has(profile.id)) {
        addIssue(ctx, ['scoreBands'], `Profile "${profile.id}" requires a score band.`);
      }
    }

    for (const profile of definition.profiles) {
      const allocation = definition.allocations[profile.id];
      if (allocation === undefined) {
        addIssue(ctx, ['allocations'], `Profile "${profile.id}" requires an allocation.`);
        continue;
      }

      for (const assetClass of definition.assetClasses) {
        if (allocation[assetClass.id] === undefined) {
          addIssue(
            ctx,
            ['allocations', profile.id],
            `Allocation requires asset class "${assetClass.id}".`,
          );
        }
      }
      for (const assetClassId of Object.keys(allocation)) {
        if (!assetClassesById.has(assetClassId)) {
          addIssue(
            ctx,
            ['allocations', profile.id, assetClassId],
            `Unknown asset class id: "${assetClassId}".`,
          );
        }
      }

      const total = Object.values(allocation).reduce((sum, value) => sum + value, 0);
      if (Math.abs(total - 100) > Number.EPSILON) {
        addIssue(
          ctx,
          ['allocations', profile.id],
          `${profile.label} allocation must total 100%.`,
        );
      }
    }

    definition.overrides.forEach((override, index) => {
      const question = questionsById.get(override.questionId);
      if (question === undefined) {
        addIssue(
          ctx,
          ['overrides', index, 'questionId'],
          `Unknown question id: "${override.questionId}".`,
        );
      } else if (!valueMatchesQuestion(override.value, question)) {
        addIssue(
          ctx,
          ['overrides', index, 'value'],
          `Override value does not match question "${question.id}".`,
        );
      }
      if (!profilesById.has(override.profileId)) {
        addIssue(
          ctx,
          ['overrides', index, 'profileId'],
          `Unknown profile id: "${override.profileId}".`,
        );
      }
    });
  });

export type RiskProfileDefinitionInput = z.input<typeof RiskProfileDefinitionSchema>;
export type RiskProfileDefinition = z.infer<typeof RiskProfileDefinitionSchema>;

interface Identified {
  readonly id: string;
}

function collectUnique<T extends Identified>(
  items: readonly T[],
  path: string,
  ctx: z.RefinementCtx,
): Map<string, T> {
  const result = new Map<string, T>();
  items.forEach((item, index) => {
    if (result.has(item.id)) {
      addIssue(ctx, [path, index, 'id'], `Duplicate id: "${item.id}".`);
    }
    result.set(item.id, item);
  });
  return result;
}

function addIssue(
  ctx: z.RefinementCtx,
  path: PropertyKey[],
  message: string,
): void {
  ctx.addIssue({ code: 'custom', message, path });
}

function valueMatchesQuestion(
  value: AnswerValue,
  question: DefinitionQuestion,
): boolean {
  if (question.type === 'number') return typeof value === 'number';
  if (question.type === 'boolean') return typeof value === 'boolean';
  return (question.options ?? []).some((option) =>
    Object.is(option.value, value),
  );
}

function typedValueKey(value: AnswerValue): string {
  return `${typeof value}:${String(value)}`;
}

function validateRangeCoverage(
  rules: readonly DefinitionScoreRule[],
  factorIndex: number,
  ctx: z.RefinementCtx,
): void {
  if (rules.some((rule) => rule.type !== 'range')) {
    addIssue(
      ctx,
      ['scoring', factorIndex, 'rules'],
      'Number questions must use range scoring rules.',
    );
    return;
  }

  const ranges = rules
    .filter((rule) => rule.type === 'range')
    .map((rule) => ({
      lower: rule.min ?? Number.NEGATIVE_INFINITY,
      upper: rule.max ?? Number.POSITIVE_INFINITY,
      includeLower: rule.includeMin,
      includeUpper: rule.includeMax,
    }))
    .sort((left, right) => left.lower - right.lower);

  if (
    ranges[0]?.lower !== Number.NEGATIVE_INFINITY ||
    ranges.at(-1)?.upper !== Number.POSITIVE_INFINITY
  ) {
    addIssue(
      ctx,
      ['scoring', factorIndex, 'rules'],
      'Number scoring ranges must cover all possible values.',
    );
    return;
  }

  for (let index = 1; index < ranges.length; index += 1) {
    const previous = ranges[index - 1];
    const current = ranges[index];
    if (previous === undefined || current === undefined) continue;

    const hasGap =
      current.lower > previous.upper ||
      (current.lower === previous.upper &&
        !current.includeLower &&
        !previous.includeUpper);
    const overlaps =
      current.lower < previous.upper ||
      (current.lower === previous.upper &&
        current.includeLower &&
        previous.includeUpper);
    if (hasGap || overlaps) {
      addIssue(
        ctx,
        ['scoring', factorIndex, 'rules'],
        `Number scoring ranges ${hasGap ? 'contain a gap' : 'overlap'}.`,
      );
      return;
    }
  }
}
