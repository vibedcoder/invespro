import { useState } from "react";
import type { BatchEvaluationResult } from "@vibedcoder/invespro-types";
import { copyText } from "./copy";
import { batchSampleJson } from "./demo-data";
import { Button } from "./fields";
import { BatchResultPanel } from "./BatchResultPanel";

export function BatchEvaluationPanel() {
  const [batchInput, setBatchInput] = useState(batchSampleJson);
  const [batchResult, setBatchResult] = useState<BatchEvaluationResult | null>(
    null,
  );
  const [batchError, setBatchError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);

  async function handleBatchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsBatchSubmitting(true);
    setBatchError(null);

    try {
      const input = JSON.parse(batchInput) as unknown;
      const response = await fetch("/api/evaluate/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Batch evaluation failed.");
      }

      setBatchResult(data);
    } catch (err) {
      setBatchError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
      setBatchResult(null);
    } finally {
      setIsBatchSubmitting(false);
    }
  }

  async function handleCopyRequest() {
    await copyText(batchInput);
    setCopyStatus("Copied batch JSON");
    window.setTimeout(() => setCopyStatus(null), 2000);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <form
        onSubmit={handleBatchSubmit}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="border-b border-slate-200 pb-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Batch Evaluation
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Send the same contract used by the REST adapter: an object with an
            items array. Each item can succeed or fail independently.
          </p>
        </div>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Batch request JSON
          <textarea
            className="mt-2 min-h-96 w-full rounded-md border border-slate-300 bg-slate-950 p-4 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            value={batchInput}
            onChange={(event) => setBatchInput(event.target.value)}
            spellCheck={false}
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
          <Button
            disabled={isBatchSubmitting}
            label="Evaluate batch"
            loadingLabel="Evaluating..."
            type="submit"
          />
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={() => setBatchInput(batchSampleJson)}
          >
            Reset sample
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={handleCopyRequest}
          >
            Copy request
          </button>
          {batchError && (
            <p className="text-sm font-medium text-red-700" role="alert">
              {batchError}
            </p>
          )}
          {copyStatus && (
            <p className="text-sm font-medium text-emerald-700">
              {copyStatus}
            </p>
          )}
        </div>
      </form>

      <BatchResultPanel result={batchResult} />
    </section>
  );
}
