import * as z from 'zod';
export declare const QuestionIdSchema: z.ZodEnum<{
    riskAttitude: "riskAttitude";
    investmentObjective: "investmentObjective";
    investmentExperience: "investmentExperience";
    investmentHorizonYears: "investmentHorizonYears";
    annualIncome: "annualIncome";
    dtiRatio: "dtiRatio";
    liquidityMonths: "liquidityMonths";
}>;
export type QuestionId = z.infer<typeof QuestionIdSchema>;
export declare const QuestionTypeSchema: z.ZodEnum<{
    number: "number";
    select: "select";
}>;
export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export declare const QuestionOptionSchema: z.ZodObject<{
    label: z.ZodString;
    value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    hint: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export declare const QuestionSchema: z.ZodObject<{
    id: z.ZodEnum<{
        riskAttitude: "riskAttitude";
        investmentObjective: "investmentObjective";
        investmentExperience: "investmentExperience";
        investmentHorizonYears: "investmentHorizonYears";
        annualIncome: "annualIncome";
        dtiRatio: "dtiRatio";
        liquidityMonths: "liquidityMonths";
    }>;
    text: z.ZodString;
    hint: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        number: "number";
        select: "select";
    }>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        hint: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    unit: z.ZodOptional<z.ZodString>;
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type Question = z.infer<typeof QuestionSchema>;
export declare const QuestionnaireAnswersSchema: z.ZodObject<{
    investmentHorizonYears: z.ZodNumber;
    riskAttitude: z.ZodString;
    investmentObjective: z.ZodString;
    annualIncome: z.ZodNumber;
    dtiRatio: z.ZodNumber;
    liquidityMonths: z.ZodNumber;
    investmentExperience: z.ZodString;
}, z.core.$strip>;
export type QuestionnaireAnswers = z.infer<typeof QuestionnaireAnswersSchema>;
//# sourceMappingURL=questionnaire.d.ts.map