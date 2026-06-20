export type SingleEvaluationRequest = ReturnType<
  typeof createSingleEvaluationRequest
>;

export type ApiError = {
  readonly message: string;
  readonly details?: unknown;
};

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

export function parseJsonInput(value: string, label: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    throw {
      message: `${label} is not valid JSON.`,
      details: {
        formErrors: [
          error instanceof Error
            ? error.message
            : "Check for missing commas, quotes, or braces.",
        ],
        fieldErrors: {},
      },
    } satisfies ApiError;
  }
}

export function toApiError(
  error: unknown,
  fallbackMessage: string,
): ApiError {
  if (isRecord(error) && typeof error.message === "string") {
    return {
      message: error.message,
      ...(error.details !== undefined && { details: error.details }),
    };
  }

  return {
    message: error instanceof Error ? error.message : fallbackMessage,
  };
}

export function errorFromResponse(
  data: unknown,
  fallbackMessage: string,
): ApiError {
  if (isRecord(data) && isRecord(data.error)) {
    return {
      message:
        typeof data.error.message === "string"
          ? data.error.message
          : fallbackMessage,
      ...(data.error.details !== undefined && { details: data.error.details }),
    };
  }

  return { message: fallbackMessage };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
