import * as z from 'zod';
import { RiskBandSchema } from '@vibedcoder/invespro-types';
import type { ApplicantInput, RiskBand } from '@vibedcoder/invespro-types';

// Internal schema — validates the raw object ZenEngine hands back.
// Not exported: the JDM output shape is an implementation detail of core.
const JdmResultSchema = z.object({
  total_score: z.number().int().min(11).max(56),
  risk_profile: RiskBandSchema,
});

export interface ParsedJdmResult {
  readonly totalScore: number;
  readonly riskProfile: RiskBand;
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

  return {
    totalScore: parsed.data.total_score,
    riskProfile: parsed.data.risk_profile,
  };
}