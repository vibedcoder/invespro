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
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-md font-bold uppercase tracking-wide text-slate-700">
              Invespro Demo
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Investment Profiling and Portfolio Allocation
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Invespro is a rules-based investment profiling and portfolio
              allocation engine with a default model, versioned customization,
              and ready-to-use CLI/REST integrations.
            </p>
          </div>
          <a
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-100"
            href="https://github.com/vibedcoder/invespro"
            rel="noreferrer"
            target="_blank"
          >
            Open source on GitHub
          </a>
        </header>

        <DemoTabs activeDefinition={activeDefinition} />
      </div>
    </main>
  );
}
