import { NextResponse } from "next/server";
import { riskProfilerEngine } from "@/lib/risk-profiler";

export function GET() {
  return NextResponse.json(riskProfilerEngine.definition);
}
