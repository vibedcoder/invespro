import type { AssetAllocation, RiskBand } from '@vibedcoder/invespro-types';

/**
 * Canonical asset allocation per risk band, per the invespro specification.
 * `satisfies` ensures every RiskBand is covered and values match AssetAllocation.
 */
export const ALLOCATION_MAP: Record<RiskBand, AssetAllocation> = {
  'Conservative': { equities: 10, fixedIncome: 60, cash: 25, alternatives: 5 },
  'Moderately Conservative': { equities: 30, fixedIncome: 50, cash: 15, alternatives: 5 },
  'Moderate': { equities: 50, fixedIncome: 35, cash: 10, alternatives: 5 },
  'Moderately Aggressive': { equities: 70, fixedIncome: 20, cash: 5,  alternatives: 5 },
  'Aggressive': { equities: 85, fixedIncome: 10, cash: 0,  alternatives: 5 },
};