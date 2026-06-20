import { useState } from "react";
import type { EvaluationResult } from "@vibedcoder/invespro-types";
import {
  customDefinitionJson,
  customEvaluationJson,
} from "./demo-data";
import { copyText } from "./copy";
import { ErrorDetails } from "./ErrorDetails";
import { Button } from "./fields";
import {
  errorFromResponse,
  parseJsonInput,
  stringifyJson,
  toApiError,
} from "./requests";
import type { ApiError } from "./requests";
import { ResultPanel } from "./ResultPanel";

export function CustomDefinitionPanel() {
  const [definitionJson, setDefinitionJson] = useState(customDefinitionJson);
  const [inputJson, setInputJson] = useState(customEvaluationJson);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const definition = parseJsonInput(definitionJson, "Definition JSON");
      const input = parseJsonInput(inputJson, "Applicant answers JSON");

      const response = await fetch("/api/evaluate/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ definition, input }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(errorFromResponse(data, "Custom evaluation failed."));
        setResult(null);
        return;
      }

      setResult(data);
    } catch (err) {
      setError(toApiError(err, "Custom evaluation failed."));
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyDefinition() {
    await copyText(definitionJson);
    showCopyStatus("Copied definition JSON");
  }

  async function copyRequest() {
    setError(null);

    try {
      const definition = parseJsonInput(definitionJson, "Definition JSON");
      const input = parseJsonInput(inputJson, "Applicant answers JSON");
      await copyText(stringifyJson({ definition, input }));
      showCopyStatus("Copied custom request JSON");
    } catch (err) {
      setError(toApiError(err, "Unable to copy custom request."));
    }
  }

  function resetExample() {
    setDefinitionJson(customDefinitionJson);
    setInputJson(customEvaluationJson);
    setResult(null);
    setError(null);
  }

  function showCopyStatus(message: string) {
    setCopyStatus(message);
    window.setTimeout(() => setCopyStatus(null), 2000);
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
      <form
        className="rounded-lg border border-border bg-card p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="border-b border-border pb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Custom Model
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Edit a versioned Invespro definition and applicant answers, then
            evaluate them without writing a custom JDM graph.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className="block text-sm font-medium text-foreground">
            Definition JSON
            <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">
              This declares the questions, scoring, profiles, bands, and
              allocations.
            </span>
            <textarea
              className="mt-2 min-h-96 w-full rounded-md border border-input bg-code p-4 font-mono text-xs leading-5 text-code-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
              onChange={(event) => setDefinitionJson(event.target.value)}
              spellCheck={false}
              value={definitionJson}
            />
          </label>

          <label className="block text-sm font-medium text-foreground">
            Applicant Answers JSON
            <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">
              Answer keys must match the question IDs declared in the definition.
            </span>
            <textarea
              className="mt-2 min-h-96 w-full rounded-md border border-input bg-code p-4 font-mono text-xs leading-5 text-code-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
              onChange={(event) => setInputJson(event.target.value)}
              spellCheck={false}
              value={inputJson}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            disabled={isSubmitting}
            label="Evaluate custom model"
            loadingLabel="Evaluating..."
            type="submit"
          />
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-card px-5 text-sm font-medium text-foreground hover:bg-muted"
            onClick={copyDefinition}
            type="button"
          >
            Copy definition
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-card px-5 text-sm font-medium text-foreground hover:bg-muted"
            onClick={copyRequest}
            type="button"
          >
            Copy request
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-card px-5 text-sm font-medium text-foreground hover:bg-muted"
            onClick={resetExample}
            type="button"
          >
            Reset example
          </button>
          {copyStatus && (
            <p className="text-sm font-medium text-success">
              {copyStatus}
            </p>
          )}
          {error && <ErrorDetails error={error} />}
        </div>
      </form>

      <div className="space-y-6">
        <aside className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            What You Can Change
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <li>Question IDs, wording, options, and required flags.</li>
            <li>Question weights and scoring rules.</li>
            <li>Profile IDs, score bands, and allocation percentages.</li>
            <li>Informational questions that are validated but not scored.</li>
          </ul>
        </aside>

        <ResultPanel result={result} />
      </div>
    </section>
  );
}
