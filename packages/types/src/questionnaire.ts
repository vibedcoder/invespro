import * as z from 'zod';

export const QuestionIdSchema = z.enum([
  'investmentHorizonYears',
  'riskAttitude',
  'investmentObjective',
  'annualIncome',
  'dtiRatio',
  'liquidityMonths',
  'investmentExperience',
]);
export type QuestionId = z.infer<typeof QuestionIdSchema>;

export const QuestionTypeSchema = z.enum(['select', 'number']);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const QuestionOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  hint: z.string().optional(),
});
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;

export const QuestionSchema = z.object({
  id: QuestionIdSchema,
  text: z.string(),
  hint: z.string().optional(),
  type: QuestionTypeSchema,
  options: z.array(QuestionOptionSchema).optional(),
  unit: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});
export type Question = z.infer<typeof QuestionSchema>;

export const QuestionnaireAnswersSchema = z.object({
  investmentHorizonYears: z.number(),
  riskAttitude: z.string(),
  investmentObjective: z.string(),
  annualIncome: z.number(),
  dtiRatio: z.number(),
  liquidityMonths: z.number(),
  investmentExperience: z.string(),
});
export type QuestionnaireAnswers = z.infer<typeof QuestionnaireAnswersSchema>;