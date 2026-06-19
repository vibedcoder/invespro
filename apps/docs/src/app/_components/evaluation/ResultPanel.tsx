import type { EvaluationResult } from "@vibedcoder/invespro-types";
import { formatAssetClass } from "./format";

export function ResultPanel({
  result,
}: {
  readonly result: EvaluationResult | null;
}) {
  const resultJson = result === null ? "" : JSON.stringify(result, null, 2);

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-lg font-semibold text-slate-950">Result</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The evaluated profile, score, allocation, and rule metadata appear
          here after submission.
        </p>
      </div>

      {result === null ? (
        <div className="mt-6 rounded-md border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
          Submit the default questionnaire to see a profile and allocation.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm text-slate-500">Profile</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {result.profile.label}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Normalized score: {result.normalizedScore.toFixed(2)}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {Object.entries(result.allocation).map(([assetClass, value]) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50 p-3"
                key={assetClass}
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {formatAssetClass(assetClass)}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-slate-950">
                  {value}%
                </dd>
              </div>
            ))}
          </dl>

          {result.scores && (
            <div>
              <h3 className="text-sm font-semibold text-slate-950">
                Score breakdown
              </h3>
              <dl className="mt-3 space-y-2">
                {Object.entries(result.scores).map(([questionId, score]) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                    key={questionId}
                  >
                    <dt className="text-xs font-medium text-slate-600">
                      {questionId}
                    </dt>
                    <dd className="text-sm font-semibold text-slate-950">
                      {score}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <pre className="max-h-96 overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-5 text-slate-100">
            {resultJson}
          </pre>
        </div>
      )}
    </aside>
  );
}
