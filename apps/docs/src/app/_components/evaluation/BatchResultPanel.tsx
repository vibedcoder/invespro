import type { BatchEvaluationResult } from "@vibedcoder/invespro-types";

export function BatchResultPanel({
  result,
}: {
  readonly result: BatchEvaluationResult | null;
}) {
  const resultJson = result === null ? "" : JSON.stringify(result, null, 2);

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-lg font-semibold text-slate-950">Batch Result</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Batch output includes a summary plus one fulfilled or rejected item
          for every applicant.
        </p>
      </div>

      {result === null ? (
        <div className="mt-6 rounded-md border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
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
                className="rounded-md border border-slate-200 bg-slate-50 p-3"
                key={item.index}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-950">
                    {item.applicantId ?? `Item ${item.index + 1}`}
                  </p>
                  <span
                    className={
                      item.status === "fulfilled"
                        ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                        : "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                    }
                  >
                    {item.status}
                  </span>
                </div>
                {item.status === "fulfilled" ? (
                  <p className="mt-2 text-sm text-slate-600">
                    {item.result.profile.label} -{" "}
                    {item.result.normalizedScore.toFixed(2)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-red-700">
                    {item.error.message}
                  </p>
                )}
              </div>
            ))}
          </div>

          <pre className="max-h-96 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-5 text-slate-100">
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
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
