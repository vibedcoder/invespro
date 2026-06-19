import type { BatchEvaluationResult } from "@vibedcoder/invespro-types";

export function BatchResultPanel({
  result,
}: {
  readonly result: BatchEvaluationResult | null;
}) {
  const resultJson = result === null ? "" : JSON.stringify(result, null, 2);

  return (
    <aside className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="border-b border-border pb-5">
        <h2 className="text-lg font-semibold text-foreground">Batch Result</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Batch output includes a summary plus one fulfilled or rejected item
          for every applicant.
        </p>
      </div>

      {result === null ? (
        <div className="mt-6 rounded-md border border-dashed border-input bg-muted p-5 text-sm leading-6 text-muted-foreground">
          Submit the sample batch to see multiple profiles at once.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <dl className="grid grid-cols-3 gap-3">
            <SummaryStat label="Total" value={result.summary.total} />
            <SummaryStat label="Fulfilled" value={result.summary.fulfilled} />
            <SummaryStat label="Rejected" value={result.summary.rejected} />
          </dl>

          <div className="space-y-3">
            {result.items.map((item) => (
              <div
                className="rounded-md border border-border bg-muted p-3"
                key={item.index}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    {item.applicantId ?? `Item ${item.index + 1}`}
                  </p>
                  <span
                    className={
                      item.status === "fulfilled"
                        ? "rounded-full bg-success/15 px-2 py-1 text-xs font-medium text-success"
                        : "rounded-full bg-destructive/15 px-2 py-1 text-xs font-medium text-destructive"
                    }
                  >
                    {item.status}
                  </span>
                </div>
                {item.status === "fulfilled" ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.result.profile.label} -{" "}
                    {item.result.normalizedScore.toFixed(2)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-destructive">
                    {item.error.message}
                  </p>
                )}
              </div>
            ))}
          </div>

          <pre className="max-h-96 overflow-auto rounded-md bg-code p-4 text-xs leading-5 text-code-foreground">
            {resultJson}
          </pre>
        </div>
      )}
    </aside>
  );
}

function SummaryStat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number;
}) {
  return (
    <div className="rounded-md border border-border bg-muted p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}
