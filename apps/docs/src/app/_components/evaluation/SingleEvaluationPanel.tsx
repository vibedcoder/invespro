import { useState } from "react";
import type { EvaluationResult } from "@zagvar/helm-types";
import {
  defaultAnswers,
  experienceOptions,
  objectiveOptions,
  riskAttitudeOptions,
} from "./demo-data";
import { copyText } from "./copy";
import { Button, NumberField, SelectField, TextField } from "./fields";
import { ErrorDetails } from "./ErrorDetails";
import {
  createSingleEvaluationRequest,
  errorFromResponse,
  stringifyJson,
  toApiError,
} from "./requests";
import type { ApiError } from "./requests";
import { ResultPanel } from "./ResultPanel";
import { Button as UiButton } from "@/components/ui/button";

export function SingleEvaluationPanel() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
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
        setError(errorFromResponse(data, "Evaluation failed."));
        setResult(null);
        return;
      }

      setResult(data);
    } catch (err) {
      setError(toApiError(err, "Something went wrong."));
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
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <form
        onSubmit={handleSubmit}
        className="min-w-0 rounded-lg border border-border bg-card p-6 shadow-sm"
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
            hint="Used only to trace the result; it does not affect scoring."
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
            hint="Higher risk tolerance generally increases the score."
            label="Market drop reaction"
            name="riskAttitude"
            options={riskAttitudeOptions}
          />
          <SelectField
            defaultValue={defaultAnswers.investmentObjective}
            hint="Objectives map to the default definition's option values."
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
            hint="At 50% or higher, the default override forces Conservative."
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
            hint="More experience contributes more points in the default model."
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
          <UiButton
            size="lg"
            variant="outline"
            type="button"
            onClick={handleCopyRequest}
          >
            Copy request
          </UiButton>
          {copyStatus && (
            <p className="text-sm font-medium text-success">
              {copyStatus}
            </p>
          )}
          {error && <ErrorDetails error={error} />}
        </div>
      </form>

      <ResultPanel result={result} />
    </section>
  );
}
