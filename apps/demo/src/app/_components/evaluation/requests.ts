export type SingleEvaluationRequest = ReturnType<
  typeof createSingleEvaluationRequest
>;

export function createSingleEvaluationRequest(formData: FormData) {
  return {
    applicantId: String(formData.get("applicantId") ?? ""),
    answers: {
      investmentHorizonYears: Number(formData.get("investmentHorizonYears")),
      riskAttitude: String(formData.get("riskAttitude")),
      investmentObjective: String(formData.get("investmentObjective")),
      annualIncome: Number(formData.get("annualIncome")),
      dtiRatio: Number(formData.get("dtiRatio")),
      liquidityMonths: Number(formData.get("liquidityMonths")),
      investmentExperience: String(formData.get("investmentExperience")),
    },
  };
}

export function stringifyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
