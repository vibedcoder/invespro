import * as z from 'zod';
import { RiskBandSchema, ScoreBreakdownSchema } from '@vibedcoder/invespro-types';
import type { ApplicantInput, RiskBand, ScoreBreakdown } from '@vibedcoder/invespro-types';

// Internal schema — validates the raw object ZenEngine hands back.
// Not exported: the JDM output shape is an implementation detail of core.
const JdmResultSchema = z.object({
  total_score: z.number().int().min(11).max(56).optional(),
  risk_profile: RiskBandSchema,
  override_applied: z.boolean().optional(),
  horizon_score: z.number().int().nonnegative().optional(),
  risk_attitude_score: z.number().int().nonnegative().optional(),
  objective_score: z.number().int().nonnegative().optional(),
  income_score: z.number().int().nonnegative().optional(),
  dti_score: z.number().int().nonnegative().optional(),
  liquidity_score: z.number().int().nonnegative().optional(),
  experience_score: z.number().int().nonnegative().optional(),
});

export interface ParsedJdmResult {
  readonly totalScore?: number;
  readonly riskProfile: RiskBand;
  readonly overrideApplied: boolean;
  readonly scores?: ScoreBreakdown;
}

/**
 * Maps camelCase ApplicantInput to the snake_case shape the JDM expects.
 * Field names must match the JDM graph's input node exactly.
 */
export function toJdmInput(input: ApplicantInput): Record<string, unknown> {
  return {
    investment_horizon_years: input.investmentHorizonYears,
    risk_attitude: input.riskAttitude,
    investment_objective: input.investmentObjective,
    annual_income: input.annualIncome,
    dti_ratio: input.dtiRatio,
    liquidity_months: input.liquidityMonths,
    investment_experience: input.investmentExperience,
  };
}

/**
 * Validates the raw ZenEngine result and maps it to our domain shape.
 * Throws a descriptive error if the JDM output doesn't match expectations —
 * which usually means the JDM graph output node is misconfigured.
 */
export function fromJdmResult(raw: unknown): ParsedJdmResult {
  const parsed = JdmResultSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(
      `[invespro-core] Unexpected JDM output shape. ` +
        `This usually means the graph output node field names don't match ` +
        `"total_score" and "risk_profile".\n${parsed.error.message}`,
    );
  }

  const overrideApplied = parsed.data.override_applied ?? false;
  if (!overrideApplied && parsed.data.total_score === undefined) {
    throw new Error(
      '[invespro-core] Unexpected JDM output shape. ' +
        'Non-override results must include "total_score".',
    );
  }

  const rawScores = {
    horizon: parsed.data.horizon_score,
    riskAttitude: parsed.data.risk_attitude_score,
    objective: parsed.data.objective_score,
    income: parsed.data.income_score,
    dti: parsed.data.dti_score,
    liquidity: parsed.data.liquidity_score,
    experience: parsed.data.experience_score,
  };
  const scores = ScoreBreakdownSchema.safeParse(rawScores);

  return {
    ...(parsed.data.total_score !== undefined && { totalScore: parsed.data.total_score }),
    riskProfile: parsed.data.risk_profile,
    overrideApplied,
    ...(scores.success && { scores: scores.data }),
  };
}
