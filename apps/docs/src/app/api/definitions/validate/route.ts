import { NextResponse } from "next/server";
import { RiskProfileDefinitionSchema } from "@zagvar/helm-types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = RiskProfileDefinitionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          valid: false,
          error: {
            code: "validation_error",
            message: "Invalid risk profile definition.",
            details: result.error.flatten(),
          },
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      valid: true,
      definition: result.data,
    });
  } catch {
    return NextResponse.json(
      {
        valid: false,
        error: {
          code: "invalid_json",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 },
    );
  }
}
