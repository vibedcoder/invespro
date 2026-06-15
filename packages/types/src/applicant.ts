import * as z from 'zod';

export const RiskAttitudeSchema = z.enum([
  'buy_more',
  'hold',
  'sell_some',
  'sell_all',
]);
export type RiskAttitude = z.infer<typeof RiskAttitudeSchema>;

export const InvestmentObjectiveSchema = z.enum([
  'maximum_growth',
  'balanced_growth',
  'income_generation',
  'capital_preservation',
]);
export type InvestmentObjective = z.infer<typeof InvestmentObjectiveSchema>;

export const InvestmentExperienceSchema = z.enum([
  'experienced',
  'intermediate',
  'beginner',
  'none',
]);
export type InvestmentExperience = z.infer<typeof InvestmentExperienceSchema>;

export const ApplicantInputSchema = z.object({
  applicantId: z.string().optional(),
  investmentHorizonYears: z.number().nonnegative(),
  riskAttitude: RiskAttitudeSchema,
  investmentObjective: InvestmentObjectiveSchema,
  annualIncome: z.number().nonnegative(),
  dtiRatio: z.number().min(0).max(100),
  liquidityMonths: z.number().nonnegative(),
  investmentExperience: InvestmentExperienceSchema,
});
export type ApplicantInput = z.infer<typeof ApplicantInputSchema>;
