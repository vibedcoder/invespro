import { useState } from "react";
import type { BatchEvaluationResult } from "@vibedcoder/invespro-types";
import { copyText } from "./copy";
import { batchSampleCsv, batchSampleJson } from "./demo-data";
import { ErrorDetails } from "./ErrorDetails";
import { Button } from "./fields";
import {
  errorFromResponse,
  parseJsonInput,
  toApiError,
} from "./requests";
import type { ApiError } from "./requests";
import { BatchResultPanel } from "./BatchResultPanel";

export function BatchEvaluationPanel() {
  const [batchInput, setBatchInput] = useState(batchSampleJson);
  const [csvInput, setCsvInput] = useState(batchSampleCsv);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<BatchEvaluationResult | null>(
    null,
  );
  const [batchError, setBatchError] = useState<ApiError | null>(null);
  const [csvError, setCsvError] = useState<ApiError | null>(null);
  const [jsonCopyStatus, setJsonCopyStatus] = useState<string | null>(null);
  const [csvCopyStatus, setCsvCopyStatus] = useState<string | null>(null);
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);
  const [isCsvSubmitting, setIsCsvSubmitting] = useState(false);

  async function handleBatchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsBatchSubmitting(true);
    setBatchError(null);

    try {
      const input = parseJsonInput(batchInput, "Batch request JSON");
      const response = await fetch("/api/evaluate/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        setBatchError(errorFromResponse(data, "Batch evaluation failed."));
        setBatchResult(null);
        return;
      }

      setBatchResult(data);
    } catch (err) {
      setBatchError(toApiError(err, "Something went wrong."));
      setBatchResult(null);
    } finally {
      setIsBatchSubmitting(false);
    }
  }

  async function handleCopyRequest() {
    await copyText(batchInput);
    setJsonCopyStatus("Copied batch JSON");
    window.setTimeout(() => setJsonCopyStatus(null), 2000);
  }

  async function handleCsvSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsCsvSubmitting(true);
    setCsvError(null);

    try {
      if (csvInput.trim().length === 0) {
        throw {
          message: "CSV input is empty.",
          details: {
            formErrors: ["Paste CSV text or upload a CSV file before evaluating."],
            fieldErrors: {},
          },
        } satisfies ApiError;
      }

      const response = await fetch("/api/evaluate/batch/csv", {
        method: "POST",
        headers: {
          "Content-Type": "text/csv",
        },
        body: csvInput,
      });
      const data = await response.json();

      if (!response.ok) {
        setCsvError(errorFromResponse(data, "CSV evaluation failed."));
        setBatchResult(null);
        return;
      }

      setBatchResult(data);
    } catch (err) {
      setCsvError(toApiError(err, "Something went wrong."));
      setBatchResult(null);
    } finally {
      setIsCsvSubmitting(false);
    }
  }

  async function handleCsvFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.currentTarget.files?.[0];
    if (file === undefined) return;

    setCsvFileName(file.name);
    setCsvInput(await file.text());
  }

  async function handleCopyCsv() {
    await copyText(csvInput);
    setCsvCopyStatus("Copied CSV");
    window.setTimeout(() => setCsvCopyStatus(null), 2000);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <div className="space-y-6">
        <form
          onSubmit={handleBatchSubmit}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="border-b border-border pb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Batch Evaluation
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Send the same contract used by the REST adapter: an object with
              an items array. Each item can succeed or fail independently.
            </p>
          </div>

          <label className="mt-6 block text-sm font-medium text-foreground">
            Batch request JSON
            <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">
              Use an object with an `items` array. Individual invalid applicants
              are returned as rejected batch rows.
            </span>
            <textarea
              className="mt-2 min-h-96 w-full rounded-md border border-input bg-code p-4 font-mono text-xs leading-5 text-code-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
              value={batchInput}
              onChange={(event) => setBatchInput(event.target.value)}
              spellCheck={false}
            />
          </label>

          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              disabled={isBatchSubmitting}
              label="Evaluate batch"
              loadingLabel="Evaluating..."
              type="submit"
            />
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-card px-5 text-sm font-medium text-foreground hover:bg-muted"
              type="button"
              onClick={() => setBatchInput(batchSampleJson)}
            >
              Reset sample
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-card px-5 text-sm font-medium text-foreground hover:bg-muted"
              type="button"
              onClick={handleCopyRequest}
            >
              Copy request
            </button>
            {jsonCopyStatus && (
              <p className="text-sm font-medium text-success">
                {jsonCopyStatus}
              </p>
            )}
            {batchError && <ErrorDetails error={batchError} />}
          </div>
        </form>

        <form
          onSubmit={handleCsvSubmit}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="border-b border-border pb-5">
            <h2 className="text-lg font-semibold text-foreground">
              CSV Upload
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Upload or paste CSV with one column per question ID. The server
              parses the file against the active definition and returns JSON.
            </p>
          </div>

          <label className="mt-6 block text-sm font-medium text-foreground">
            CSV file
            <input
              accept=".csv,text/csv"
              className="mt-2 block w-full rounded-md border border-input bg-card text-sm text-foreground file:mr-4 file:h-11 file:border-0 file:bg-primary file:px-5 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90"
              onChange={handleCsvFileChange}
              type="file"
            />
          </label>
          {csvFileName && (
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              Loaded {csvFileName}
            </p>
          )}

          <label className="mt-5 block text-sm font-medium text-foreground">
            CSV preview
            <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">
              Headers must match active definition question IDs. Unknown columns
              are ignored.
            </span>
            <textarea
              className="mt-2 min-h-56 w-full rounded-md border border-input bg-code p-4 font-mono text-xs leading-5 text-code-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
              value={csvInput}
              onChange={(event) => setCsvInput(event.target.value)}
              spellCheck={false}
            />
          </label>

          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              disabled={isCsvSubmitting}
              label="Evaluate CSV batch"
              loadingLabel="Evaluating..."
              type="submit"
            />
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-card px-5 text-sm font-medium text-foreground hover:bg-muted"
              type="button"
              onClick={() => {
                setCsvInput(batchSampleCsv);
                setCsvFileName(null);
              }}
            >
              Reset sample
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-card px-5 text-sm font-medium text-foreground hover:bg-muted"
              type="button"
              onClick={handleCopyCsv}
            >
              Copy CSV
            </button>
            {csvCopyStatus && (
              <p className="text-sm font-medium text-success">
                {csvCopyStatus}
              </p>
            )}
            {csvError && <ErrorDetails error={csvError} />}
          </div>
        </form>
      </div>

      <BatchResultPanel result={batchResult} />
    </section>
  );
}
