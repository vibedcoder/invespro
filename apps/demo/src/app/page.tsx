import Link from "next/link";
import { ArrowRight, BookOpen, Code2, FileText, GitBranch } from "lucide-react";
import { SiteHeader } from "./_components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Invespro",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: "https://invespro.vercel.app",
  codeRepository: "https://github.com/vibedcoder/invespro",
  creator: {
    "@type": "Organization",
    name: "Vibedcoder",
    url: "https://github.com/vibedcoder",
  },
  description:
    "Rules-based investment profiling and portfolio allocation engine with JSON, CSV, REST, and CLI evaluation flows.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-8 lg:px-10">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-700">
              Invespro
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Rules-based investment profiling and portfolio allocation.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Use the default model immediately, customize the definition when
              your policy differs, and evaluate applicants through TypeScript,
              REST, CLI, JSON, or CSV batch flows.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/docs">
                  Read the docs
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/demo">Open demo</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <a
                  href="https://github.com/vibedcoder/invespro"
                  rel="noreferrer"
                  target="_blank"
                >
                  <GitBranch aria-hidden="true" className="size-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Install</CardTitle>
              <CardDescription>
                Start with core for embedded evaluation or add the REST adapter.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                <code>pnpm add @vibedcoder/invespro-core</code>
              </pre>
              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <p>Current public packages:</p>
                <ul className="grid gap-1 font-mono text-xs">
                  <li>@vibedcoder/invespro-core</li>
                  <li>@vibedcoder/invespro-hono</li>
                  <li>@vibedcoder/invespro-cli</li>
                  <li>@vibedcoder/invespro-types</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <section
          aria-labelledby="capabilities-heading"
          className="grid gap-4 md:grid-cols-3"
        >
          <h2 className="sr-only" id="capabilities-heading">
            Capabilities
          </h2>
          {[
            {
              title: "Definition-driven",
              description:
                "Questions, scoring, weights, bands, overrides, and allocations are modeled in versioned definitions.",
              icon: FileText,
            },
            {
              title: "Integration-ready",
              description:
                "Embed the core engine, expose Hono REST endpoints, or run evaluations through the CLI.",
              icon: Code2,
            },
            {
              title: "Docs and examples",
              description:
                "Follow focused guides for single evaluation, CSV batch input, custom definitions, and API contracts.",
              icon: BookOpen,
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon aria-hidden="true" className="size-5 text-slate-700" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Need to see the result shape first?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The interactive demo runs the same workspace packages used by the
              REST adapter and package examples.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/demo">Try evaluation flows</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
