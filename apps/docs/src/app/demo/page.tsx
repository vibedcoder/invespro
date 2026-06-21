import type { Metadata } from "next";
import { DemoTabs } from "../_components/DemoTabs";
import { SiteHeader } from "../_components/SiteHeader";
import { riskProfilerEngine } from "@/lib/risk-profiler";

export const metadata: Metadata = {
  title: "Interactive Demo",
  description:
    "Try Invespro single applicant, batch, CSV, and custom definition evaluation flows.",
};

export default function DemoPage() {
  const activeDefinition = riskProfilerEngine.definition;

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto flex min-w-0 w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-md font-bold uppercase tracking-wide text-primary">
              Invespro Demo
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              Investment Profiling and Portfolio Allocation
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Invespro is a rules-based investment profiling and portfolio
              allocation engine with a default model, versioned customization,
              and ready-to-use CLI/REST integrations.
            </p>
          </div>
        </header>

        <DemoTabs activeDefinition={activeDefinition} />
      </div>
    </main>
  );
}
