import * as z from 'zod';

export const RiskBandSchema = z.enum([
  'Conservative',
  'Moderately Conservative',
  'Moderate',
  'Moderately Aggressive',
  'Aggressive',
]);
export type RiskBand = z.infer<typeof RiskBandSchema>;

export const AssetAllocationSchema = z.object({
  equities: z.number().min(0).max(100),
  fixedIncome: z.number().min(0).max(100),
  cash: z.number().min(0).max(100),
  alternatives: z.number().min(0).max(100),
});
export type AssetAllocation = z.infer<typeof AssetAllocationSchema>;

export const ScoreBreakdownSchema = z.object({
  horizon: z.number().int().nonnegative(),
  riskAttitude: z.number().int().nonnegative(),
  objective: z.number().int().nonnegative(),
  income: z.number().int().nonnegative(),
  dti: z.number().int().nonnegative(),
  liquidity: z.number().int().nonnegative(),
  experience: z.number().int().nonnegative(),
});
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;

export const EvaluationResultSchema = z.object({
  applicantId: z.string().optional(),
  scores: ScoreBreakdownSchema.optional(),
  totalScore: z.number().int().min(11).max(56).optional(),
  riskProfile: RiskBandSchema,
  overrideApplied: z.boolean(),
  allocation: AssetAllocationSchema,
  evaluatedAt: z.iso.datetime(),
  jdmVersion: z.string(),
});
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
