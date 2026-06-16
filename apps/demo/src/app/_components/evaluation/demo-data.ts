type SelectOption = {
  readonly label: string;
  readonly value: string;
};

type DemoAnswers = {
  readonly investmentHorizonYears: number;
  readonly riskAttitude: string;
  readonly investmentObjective: string;
  readonly annualIncome: number;
  readonly dtiRatio: number;
  readonly liquidityMonths: number;
  readonly investmentExperience: string;
};

type DemoApplicant = {
  readonly applicantId: string;
  readonly answers: DemoAnswers;
};

export const riskAttitudeOptions: SelectOption[] = [
  { label: "Buy more - capitalise on lower prices", value: "buy_more" },
  { label: "Hold - wait for recovery", value: "hold" },
  { label: "Sell some - move to safer assets", value: "sell_some" },
  { label: "Sell all - prevent further losses", value: "sell_all" },
];

export const objectiveOptions: SelectOption[] = [
  { label: "Maximum Growth", value: "maximum_growth" },
  { label: "Balanced Growth", value: "balanced_growth" },
  { label: "Income Generation", value: "income_generation" },
  { label: "Capital Preservation", value: "capital_preservation" },
];

export const experienceOptions: SelectOption[] = [
  { label: "Experienced - 5+ years", value: "experienced" },
  { label: "Intermediate - 2-5 years", value: "intermediate" },
  { label: "Beginner - under 2 years", value: "beginner" },
  { label: "None", value: "none" },
];

export const defaultAnswers = {
  applicantId: "APP-001",
  investmentHorizonYears: 10,
  riskAttitude: "hold",
  investmentObjective: "balanced_growth",
  annualIncome: 95000,
  dtiRatio: 22,
  liquidityMonths: 4,
  investmentExperience: "intermediate",
};

export const batchSample = {
  items: [
    {
      applicantId: "APP-001",
      answers: {
        investmentHorizonYears: 10,
        riskAttitude: "hold",
        investmentObjective: "balanced_growth",
        annualIncome: 95000,
        dtiRatio: 22,
        liquidityMonths: 4,
        investmentExperience: "intermediate",
      },
    },
    {
      applicantId: "APP-002",
      answers: {
        investmentHorizonYears: 18,
        riskAttitude: "buy_more",
        investmentObjective: "maximum_growth",
        annualIncome: 180000,
        dtiRatio: 12,
        liquidityMonths: 8,
        investmentExperience: "experienced",
      },
    },
    {
      applicantId: "APP-003",
      answers: {
        investmentHorizonYears: 2,
        riskAttitude: "sell_all",
        investmentObjective: "capital_preservation",
        annualIncome: 48000,
        dtiRatio: 52,
        liquidityMonths: 1,
        investmentExperience: "none",
      },
    },
  ] satisfies readonly DemoApplicant[],
};

export const batchSampleJson = JSON.stringify(batchSample, null, 2);

export type { SelectOption };
