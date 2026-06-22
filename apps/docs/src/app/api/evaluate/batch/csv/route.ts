import { parseCsvBatch } from "@zagvar/helm-core";
import { NextResponse } from "next/server";
import { riskProfilerEngine } from "@/lib/risk-profiler";

export async function POST(request: Request) {
  try {
    const csv = await request.text();
    const items = parseCsvBatch(csv, riskProfilerEngine.definition);
    const result = await riskProfilerEngine.evaluateMany(
      {
        items,
      },
      {
        maxBatchSize: 100,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "csv_batch_evaluation_error",
          message:
            error instanceof Error
              ? error.message
              : "CSV batch evaluation failed.",
        },
      },
      { status: 400 },
    );
  }
}
