import { useState } from "react";
import type { EvaluationResult } from "@vibedcoder/invespro-types";
import {
  defaultAnswers,
  experienceOptions,
  objectiveOptions,
  riskAttitudeOptions,
} from "./demo-data";
import { copyText } from "./copy";
import { Button, NumberField, SelectField, TextField } from "./fields";
import { createSingleEvaluationRequest, stringifyJson } from "./requests";
import { ResultPanel } from "./ResultPanel";

export function SingleEvaluationPanel() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const input = createSingleEvaluationRequest(formData);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message ?? "Evaluation failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyRequest(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (form === null) return;

    const input = createSingleEvaluationRequest(new FormData(form));
    await copyText(stringifyJson(input));
    setCopyStatus("Copied request JSON");
    window.setTimeout(() => setCopyStatus(null), 2000);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="border-b border-border pb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Single Applicant
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Default values are filled in so you can submit immediately, then
            adjust the answers and compare results.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <TextField
            defaultValue={defaultAnswers.applicantId}
            label="Applicant ID"
            name="applicantId"
          />
          <NumberField
            defaultValue={defaultAnswers.investmentHorizonYears}
            label="Investment horizon"
            max={50}
            min={0}
            name="investmentHorizonYears"
            suffix="years"
          />
          <SelectField
            defaultValue={defaultAnswers.riskAttitude}
            label="Market drop reaction"
            name="riskAttitude"
            options={riskAttitudeOptions}
          />
          <SelectField
            defaultValue={defaultAnswers.investmentObjective}
            label="Investment objective"
            name="investmentObjective"
            options={objectiveOptions}
          />
          <NumberField
            defaultValue={defaultAnswers.annualIncome}
            label="Gross annual income"
            min={0}
            name="annualIncome"
            prefix="AUD"
          />
          <NumberField
            defaultValue={defaultAnswers.dtiRatio}
            label="Debt-to-income ratio"
            max={100}
            min={0}
            name="dtiRatio"
            suffix="%"
          />
          <NumberField
            defaultValue={defaultAnswers.liquidityMonths}
            label="Liquid reserves"
            min={0}
            name="liquidityMonths"
            suffix="months"
          />
          <SelectField
            defaultValue={defaultAnswers.investmentExperience}
            label="Investment experience"
            name="investmentExperience"
            options={experienceOptions}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
          <Button
            disabled={isSubmitting}
            label="Evaluate profile"
            loadingLabel="Evaluating..."
            type="submit"
          />
          {error && (
            <p className="text-sm font-medium text-destructive" role="alert">
              {error}
            </p>
          )}
          <button
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-card px-5 text-sm font-medium text-foreground hover:bg-muted"
            type="button"
            onClick={handleCopyRequest}
          >
            Copy request
          </button>
          {copyStatus && (
            <p className="text-sm font-medium text-success">
              {copyStatus}
            </p>
          )}
        </div>
      </form>

      <ResultPanel result={result} />
    </section>
  );
}
