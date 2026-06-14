import * as z from 'zod';
export declare const RiskBandSchema: z.ZodEnum<{
    Conservative: "Conservative";
    "Moderately Conservative": "Moderately Conservative";
    Moderate: "Moderate";
    "Moderately Aggressive": "Moderately Aggressive";
    Aggressive: "Aggressive";
}>;
export type RiskBand = z.infer<typeof RiskBandSchema>;
export declare const AssetAllocationSchema: z.ZodObject<{
    equities: z.ZodNumber;
    fixedIncome: z.ZodNumber;
    cash: z.ZodNumber;
    alternatives: z.ZodNumber;
}, z.core.$strip>;
export type AssetAllocation = z.infer<typeof AssetAllocationSchema>;
export declare const ScoreBreakdownSchema: z.ZodObject<{
    horizon: z.ZodNumber;
    riskAttitude: z.ZodNumber;
    objective: z.ZodNumber;
    income: z.ZodNumber;
    dti: z.ZodNumber;
    liquidity: z.ZodNumber;
    experience: z.ZodNumber;
}, z.core.$strip>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
export declare const EvaluationResultSchema: z.ZodObject<{
    applicantId: z.ZodOptional<z.ZodString>;
    scores: z.ZodOptional<z.ZodObject<{
        horizon: z.ZodNumber;
        riskAttitude: z.ZodNumber;
        objective: z.ZodNumber;
        income: z.ZodNumber;
        dti: z.ZodNumber;
        liquidity: z.ZodNumber;
        experience: z.ZodNumber;
    }, z.core.$strip>>;
    totalScore: z.ZodNumber;
    riskProfile: z.ZodEnum<{
        Conservative: "Conservative";
        "Moderately Conservative": "Moderately Conservative";
        Moderate: "Moderate";
        "Moderately Aggressive": "Moderately Aggressive";
        Aggressive: "Aggressive";
    }>;
    overrideApplied: z.ZodBoolean;
    allocation: z.ZodObject<{
        equities: z.ZodNumber;
        fixedIncome: z.ZodNumber;
        cash: z.ZodNumber;
        alternatives: z.ZodNumber;
    }, z.core.$strip>;
    evaluatedAt: z.ZodISODateTime;
    jdmVersion: z.ZodString;
}, z.core.$strip>;
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
//# sourceMappingURL=profile.d.ts.map