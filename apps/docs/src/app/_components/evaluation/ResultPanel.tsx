import type { EvaluationResult } from "@zagvar/helm-types";
import { formatAssetClass } from "./format";

export function ResultPanel({
  result,
}: {
  readonly result: EvaluationResult | null;
}) {
  const resultJson = result === null ? "" : JSON.stringify(result, null, 2);

  return (
    <aside className="min-w-0 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="border-b border-border pb-5">
        <h2 className="text-lg font-semibold text-foreground">Result</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The evaluated profile, score, allocation, and rule metadata appear
          here after submission.
        </p>
      </div>

      {result === null ? (
        <div className="mt-6 rounded-md border border-dashed border-input bg-muted p-5 text-sm leading-6 text-muted-foreground">
          Submit the default questionnaire to see a profile and allocation.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">Profile</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {result.profile.label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Normalized score: {result.normalizedScore.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Override:{" "}
              {result.overrideApplied
                ? result.overrideId ?? "applied"
                : "not applied"}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(result.allocation).map(([assetClass, value]) => (
              <div
                className="min-w-0 rounded-md border border-border bg-muted p-3"
                key={assetClass}
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {formatAssetClass(assetClass)}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">
                  {value}%
                </dd>
              </div>
            ))}
          </dl>

          {result.scores && (
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Score breakdown
              </h3>
              <dl className="mt-3 space-y-2">
                {Object.entries(result.scores).map(([questionId, score]) => (
                  <div
                    className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border bg-muted px-3 py-2"
                    key={questionId}
                  >
                    <dt className="min-w-0 break-words text-xs font-medium text-muted-foreground">
                      {questionId}
                    </dt>
                    <dd className="text-sm font-semibold text-foreground">
                      {score}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="break-all rounded-md border border-border bg-muted p-3 text-xs leading-5 text-muted-foreground">
            Definition {result.definition.id}@{result.definition.version}
            <br />
            {result.definition.graphChecksum}
          </div>

          <pre className="max-h-96 max-w-full overflow-auto rounded-md bg-code p-4 text-xs leading-5 text-code-foreground">
            {resultJson}
          </pre>
        </div>
      )}
    </aside>
  );
}
