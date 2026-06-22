import type { Question } from '@zagvar/helm-types';

/**
 * The fixed set of 7 profiling questions.
 * IDs map 1:1 to ApplicantInput fields.
 * Used by the CLI runner and any future UI adapter.
 */
export const QUESTIONS: readonly Question[] = [
  {
    id: 'investmentHorizonYears',
    text: 'How many years do you plan to hold your investments before needing access?',
    hint: 'Think about your next major financial goal.',
    type: 'number',
    unit: 'years',
    min: 0,
    max: 50,
  },
  {
    id: 'riskAttitude',
    text: 'If your portfolio dropped 25% due to market volatility, what would you do?',
    type: 'select',
    options: [
      { label: 'Buy more — capitalise on lower prices', value: 'buy_more' },
      { label: 'Hold — wait for recovery', value: 'hold' },
      { label: 'Sell some — move to safer assets', value: 'sell_some' },
      { label: 'Sell all — prevent further losses', value: 'sell_all' },
    ],
  },
  {
    id: 'investmentObjective',
    text: 'What is your primary investment goal?',
    type: 'select',
    options: [
      { label: 'Maximum Growth — maximise returns regardless of volatility', value: 'maximum_growth' },
      { label: 'Balanced Growth — grow wealth while limiting major losses', value: 'balanced_growth' },
      { label: 'Income Generation — earn regular returns with minimal principal risk', value: 'income_generation' },
      { label: 'Capital Preservation — protect capital above all else', value: 'capital_preservation' },
    ],
  },
  {
    id: 'annualIncome',
    text: 'What is your gross annual income?',
    type: 'number',
    unit: 'AUD',
    min: 0,
  },
  {
    id: 'dtiRatio',
    text: 'What percentage of your gross income goes toward debt repayments?',
    hint: 'Include mortgage, car loans, credit cards, and all other debt.',
    type: 'number',
    unit: '%',
    min: 0,
    max: 100,
  },
  {
    id: 'liquidityMonths',
    text: 'How many months of living expenses do you have in liquid assets?',
    hint: 'Cash and savings only — exclude the amount you plan to invest.',
    type: 'number',
    unit: 'months',
    min: 0,
  },
  {
    id: 'investmentExperience',
    text: 'How would you describe your investment experience?',
    type: 'select',
    options: [
      { label: 'Experienced — 5+ years with complex instruments', value: 'experienced' },
      { label: 'Intermediate — 2–5 years with mixed asset classes', value: 'intermediate' },
      { label: 'Beginner — under 2 years with simple products', value: 'beginner' },
      { label: 'None — no prior investment experience', value: 'none' },
    ],
  },
];