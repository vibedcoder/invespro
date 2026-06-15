import { RiskProfileDefinitionSchema } from '@vibedcoder/invespro-types';
import { ALLOCATION_MAP } from './allocations.js';
import { QUESTIONS } from './questions.js';

/**
 * Opinionated Australian-dollar model matching the original Invespro rules.
 *
 * Original point maxima are used as relative weights so normalized scoring
 * preserves the existing profile decisions.
 */
export const DEFAULT_RISK_PROFILE_DEFINITION = RiskProfileDefinitionSchema.parse({
  schemaVersion: '1.0',
  id: 'invesproDefaultRiskProfiler',
  name: 'Invespro Default Investment Risk Profiler',
  version: '0.1.0',
  currency: 'AUD',
  questions: QUESTIONS.map((question) => ({
    ...question,
    purpose: 'scored' as const,
  })),
  scoring: [
    {
      questionId: 'investmentHorizonYears',
      weight: 10,
      rules: [
        { type: 'range', min: 15, includeMin: false, score: 10 },
        { type: 'range', min: 8, max: 15, includeMax: true, score: 7 },
        { type: 'range', min: 3, max: 8, score: 4 },
        { type: 'range', max: 3, score: 2 },
      ],
    },
    {
      questionId: 'riskAttitude',
      weight: 10,
      rules: [
        { type: 'option', value: 'buy_more', score: 10 },
        { type: 'option', value: 'hold', score: 7 },
        { type: 'option', value: 'sell_some', score: 4 },
        { type: 'option', value: 'sell_all', score: 2 },
      ],
    },
    {
      questionId: 'investmentObjective',
      weight: 8,
      rules: [
        { type: 'option', value: 'maximum_growth', score: 8 },
        { type: 'option', value: 'balanced_growth', score: 6 },
        { type: 'option', value: 'income_generation', score: 4 },
        { type: 'option', value: 'capital_preservation', score: 2 },
      ],
    },
    {
      questionId: 'annualIncome',
      weight: 8,
      rules: [
        { type: 'range', min: 150_000, score: 8 },
        { type: 'range', min: 90_000, max: 150_000, score: 6 },
        { type: 'range', min: 50_000, max: 90_000, score: 4 },
        { type: 'range', max: 50_000, score: 2 },
      ],
    },
    {
      questionId: 'dtiRatio',
      weight: 8,
      rules: [
        { type: 'range', max: 15, score: 8 },
        { type: 'range', min: 15, max: 30, score: 6 },
        { type: 'range', min: 30, max: 45, score: 3 },
        { type: 'range', min: 45, score: 1 },
      ],
    },
    {
      questionId: 'liquidityMonths',
      weight: 6,
      rules: [
        { type: 'range', min: 6, includeMin: false, score: 6 },
        { type: 'range', min: 3, max: 6, includeMax: true, score: 4 },
        { type: 'range', min: 1, max: 3, score: 2 },
        { type: 'range', max: 1, score: 1 },
      ],
    },
    {
      questionId: 'investmentExperience',
      weight: 6,
      rules: [
        { type: 'option', value: 'experienced', score: 6 },
        { type: 'option', value: 'intermediate', score: 4 },
        { type: 'option', value: 'beginner', score: 2 },
        { type: 'option', value: 'none', score: 1 },
      ],
    },
  ],
  profiles: [
    { id: 'conservative', label: 'Conservative', order: 0 },
    {
      id: 'moderatelyConservative',
      label: 'Moderately Conservative',
      order: 1,
    },
    { id: 'moderate', label: 'Moderate', order: 2 },
    {
      id: 'moderatelyAggressive',
      label: 'Moderately Aggressive',
      order: 3,
    },
    { id: 'aggressive', label: 'Aggressive', order: 4 },
  ],
  scoreBands: [
    { profileId: 'aggressive', minScore: (47 / 56) * 100 },
    { profileId: 'moderatelyAggressive', minScore: (38 / 56) * 100 },
    { profileId: 'moderate', minScore: (29 / 56) * 100 },
    { profileId: 'moderatelyConservative', minScore: (20 / 56) * 100 },
    { profileId: 'conservative', minScore: 0 },
  ],
  assetClasses: [
    { id: 'equities', label: 'Equities' },
    { id: 'fixedIncome', label: 'Fixed Income' },
    { id: 'cash', label: 'Cash' },
    { id: 'alternatives', label: 'Alternatives' },
  ],
  allocations: {
    conservative: ALLOCATION_MAP.Conservative,
    moderatelyConservative: ALLOCATION_MAP['Moderately Conservative'],
    moderate: ALLOCATION_MAP.Moderate,
    moderatelyAggressive: ALLOCATION_MAP['Moderately Aggressive'],
    aggressive: ALLOCATION_MAP.Aggressive,
  },
  overrides: [
    {
      id: 'dtiConservativeOverride',
      description: 'DTI ratio of 50% or more is assigned a Conservative profile.',
      questionId: 'dtiRatio',
      operator: '>=',
      value: 50,
      profileId: 'conservative',
    },
  ],
});
