import * as z from 'zod';
export declare const RiskAttitudeSchema: z.ZodEnum<{
    buy_more: "buy_more";
    hold: "hold";
    sell_some: "sell_some";
    sell_all: "sell_all";
}>;
export type RiskAttitude = z.infer<typeof RiskAttitudeSchema>;
export declare const InvestmentObjectiveSchema: z.ZodEnum<{
    maximum_growth: "maximum_growth";
    balanced_growth: "balanced_growth";
    income_generation: "income_generation";
    capital_preservation: "capital_preservation";
}>;
export type InvestmentObjective = z.infer<typeof InvestmentObjectiveSchema>;
export declare const InvestmentExperienceSchema: z.ZodEnum<{
    experienced: "experienced";
    intermediate: "intermediate";
    beginner: "beginner";
    none: "none";
}>;
export type InvestmentExperience = z.infer<typeof InvestmentExperienceSchema>;
export declare const ApplicantInputSchema: z.ZodObject<{
    applicantId: z.ZodOptional<z.ZodString>;
    investmentHorizonYears: z.ZodNumber;
    riskAttitude: z.ZodEnum<{
        buy_more: "buy_more";
        hold: "hold";
        sell_some: "sell_some";
        sell_all: "sell_all";
    }>;
    investmentObjective: z.ZodEnum<{
        maximum_growth: "maximum_growth";
        balanced_growth: "balanced_growth";
        income_generation: "income_generation";
        capital_preservation: "capital_preservation";
    }>;
    annualIncome: z.ZodNumber;
    dtiRatio: z.ZodNumber;
    liquidityMonths: z.ZodNumber;
    investmentExperience: z.ZodEnum<{
        experienced: "experienced";
        intermediate: "intermediate";
        beginner: "beginner";
        none: "none";
    }>;
}, z.core.$strip>;
export type ApplicantInput = z.infer<typeof ApplicantInputSchema>;
//# sourceMappingURL=applicant.d.ts.map