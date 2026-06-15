import * as z from 'zod';
import { AnswerValueSchema } from './definition.js';

export const RiskProfileAnswersSchema = z.record(z.string(), AnswerValueSchema);
export type RiskProfileAnswers = z.infer<typeof RiskProfileAnswersSchema>;

/**
 * Definition-driven evaluation envelope.
 *
 * The engine also accepts the original flat default input for compatibility.
 */
export const RiskProfileEvaluationInputSchema = z.object({
  applicantId: z.string().optional(),
  answers: RiskProfileAnswersSchema,
});
export type RiskProfileEvaluationInput = z.infer<
  typeof RiskProfileEvaluationInputSchema
>;
