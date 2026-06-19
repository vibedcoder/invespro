import { NextResponse } from "next/server";
import { riskProfilerEngine } from "@/lib/risk-profiler";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const result = await riskProfilerEngine.evaluateMany(input, {
      maxBatchSize: 100,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "evaluation_error",
          message:
            error instanceof Error ? error.message : "Batch evaluation failed.",
        },
      },
      { status: 400 },
    );
  }
}
