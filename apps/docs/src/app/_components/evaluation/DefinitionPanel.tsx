import type { RiskProfileDefinition } from "@vibedcoder/invespro-types";
import { formatAssetClass } from "./format";

export function DefinitionPanel({
  definition,
}: {
  readonly definition: RiskProfileDefinition;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="border-b border-border pb-5">
        <h2 className="text-lg font-semibold text-foreground">
          Active Definition
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The demo is using this versioned scoring and allocation model.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-muted p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Model
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {definition.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {definition.id} - v{definition.version}
          </p>
        </div>

        <div className="rounded-md border border-border bg-muted p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Profiles
          </p>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {[...definition.profiles]
              .sort((left, right) => left.order - right.order)
              .map((profile) => (
                <li key={profile.id}>{profile.label}</li>
              ))}
          </ul>
        </div>

        <div className="rounded-md border border-border bg-muted p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Score bands
          </p>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
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
          <p className="text-sm font-semibold text-foreground">
            Allocation map
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[...definition.profiles]
              .sort((left, right) => left.order - right.order)
              .map((profile) => (
                <div
                  className="rounded-md border border-border bg-muted p-3"
                  key={profile.id}
                >
                  <p className="text-sm font-medium text-foreground">
                    {profile.label}
                  </p>
                  <dl className="mt-2 space-y-1">
                    {Object.entries(definition.allocations[profile.id] ?? {}).map(
                      ([assetClass, value]) => (
                        <div
                          className="flex justify-between gap-3 text-xs text-muted-foreground"
                          key={assetClass}
                        >
                          <dt>{formatAssetClass(assetClass)}</dt>
                          <dd className="font-medium text-foreground">
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
