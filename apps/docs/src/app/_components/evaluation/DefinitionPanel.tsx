import type { RiskProfileDefinition } from "@vibedcoder/invespro-types";
import { formatAssetClass } from "./format";

export function DefinitionPanel({
  definition,
}: {
  readonly definition: RiskProfileDefinition;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Active Definition
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The demo is using this versioned scoring and allocation model.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Model
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {definition.name}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {definition.id} - v{definition.version}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Profiles
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {[...definition.profiles]
              .sort((left, right) => left.order - right.order)
              .map((profile) => (
                <li key={profile.id}>{profile.label}</li>
              ))}
          </ul>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Score bands
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {[...definition.scoreBands]
              .sort((left, right) => right.minScore - left.minScore)
              .map((band) => {
                const profile = definition.profiles.find(
                  (candidate) => candidate.id === band.profileId,
                );
                return (
                  <li key={band.profileId}>
                    {profile?.label ?? band.profileId}:{" "}
                    {band.minScore.toFixed(2)}+
                  </li>
                );
              })}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className="text-sm font-semibold text-slate-950">
            Allocation map
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[...definition.profiles]
              .sort((left, right) => left.order - right.order)
              .map((profile) => (
                <div
                  className="rounded-md border border-slate-200 bg-slate-50 p-3"
                  key={profile.id}
                >
                  <p className="text-sm font-medium text-slate-950">
                    {profile.label}
                  </p>
                  <dl className="mt-2 space-y-1">
                    {Object.entries(definition.allocations[profile.id] ?? {}).map(
                      ([assetClass, value]) => (
                        <div
                          className="flex justify-between gap-3 text-xs text-slate-600"
                          key={assetClass}
                        >
                          <dt>{formatAssetClass(assetClass)}</dt>
                          <dd className="font-medium text-slate-950">
                            {value}%
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
