import styles from "./ProductMotionPreview.module.css";

const csvRows = [
  ["APP-001", "hold", "balanced_growth", "95000", "22"],
  ["APP-002", "buy_more", "maximum_growth", "180000", "12"],
  ["APP-003", "hold", "balanced_growth", "125000", "28"],
  ["APP-004", "sell", "capital_preservation", "72000", "35"],
  ["APP-005", "hold", "income", "88000", ""],
] as const;

const csvResults = [
  ["APP-001", "Balanced", "82", "fulfilled"],
  ["APP-002", "Growth", "91", "fulfilled"],
  ["APP-003", "Moderate", "68", "fulfilled"],
  ["APP-004", "Conservative", "44", "fulfilled"],
  ["APP-005", "Rejected", "-", "rejected"],
] as const;

const customizedResults = [
  ["APP-001", "Balanced+", "86", "fulfilled"],
  ["APP-002", "Growth", "94", "fulfilled"],
  ["APP-003", "Balanced", "74", "fulfilled"],
  ["APP-004", "Conservative", "48", "fulfilled"],
  ["APP-005", "Rejected", "-", "rejected"],
] as const;

const evaluationSteps = [
  "Parsing CSV values",
  "Normalizing questionnaire answers",
  "Applying risk overrides",
  "Resolving portfolio allocation",
] as const;

export function ProductMotionPreview() {
  return (
    <div
      aria-label="Looping preview of CSV batch evaluation and custom definition editing"
      className="overflow-hidden rounded-md border border-border bg-background shadow-inner"
      role="img"
    >
      <div className="flex items-center justify-between border-b border-border bg-muted px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-warning/80" />
          <span className="size-2.5 rounded-full bg-success/70" />
        </div>
        <span className="rounded-full bg-card px-2 py-1 text-[0.65rem] font-medium text-muted-foreground">
          live preview
        </span>
      </div>

      <div className="relative h-[420px] overflow-hidden p-3">
        <FeatureIntro
          className={`${styles.stage} ${styles.csvIntro}`}
          description="Upload a CSV, evaluate every applicant, and inspect detailed scoring."
          title="Batch CSV evaluation"
        />

        <div className={`${styles.stage} ${styles.csvUpload}`}>
          <PreviewHeader
            description="Choose a CSV exported from your applicant workflow."
            label="Batch CSV evaluation"
            status="ready"
            title="Upload applicant data"
          />
          <div className="mt-4 rounded-md border border-dashed border-input bg-muted p-4">
            <p className="text-xs font-semibold text-foreground">
              applicant-batch.csv
            </p>
            <p className="mt-1 text-[0.68rem] text-muted-foreground">
              5 applicants, 8 matched questionnaire columns. File selected and
              ready for batch evaluation.
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className={`${styles.meter} h-full rounded-full bg-accent`}
              />
            </div>
          </div>
          <div className="mt-4 grid gap-1.5 font-mono text-[0.62rem] text-muted-foreground">
            <p>applicantId,riskAttitude,objective,income,dti</p>
            {csvRows.map((row) => (
              <p className="truncate" key={row[0]}>
                {row.join(",")}
              </p>
            ))}
          </div>
        </div>

        <div className={`${styles.stage} ${styles.csvEvaluate}`}>
          <PreviewHeader
            description="Parse, normalize, apply overrides, and resolve allocation."
            label="Batch CSV evaluation"
            status="evaluating"
            title="Running definition-aware scoring"
          />
          <div className="mt-4 grid gap-2">
            {evaluationSteps.map((item) => (
              <div
                className="flex items-center justify-between rounded-md border border-border bg-muted px-3 py-2"
                key={item}
              >
                <span className="text-xs text-foreground">{item}</span>
                <EvaluationState />
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.stage} ${styles.csvResults}`}>
          <PreviewHeader
            description="Review every applicant without losing partial successes."
            label="Batch CSV evaluation"
            status="complete"
            title="Batch result"
          />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ["5", "rows"],
              ["4", "fulfilled"],
              ["1", "rejected"],
            ].map(([value, label]) => (
              <div
                className="rounded-md border border-border bg-muted p-2"
                key={label}
              >
                <p className="text-lg font-semibold text-foreground">{value}</p>
                <p className="text-[0.62rem] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-1.5 font-mono text-[0.62rem]">
            {csvResults.map(([id, profile, score, status], index) => (
              <div
                className={`${styles.item} grid grid-cols-[52px_1fr_32px_56px] items-center gap-2 rounded bg-muted px-2 py-1.5`}
                key={id}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <span className="text-muted-foreground">{id}</span>
                <span className="truncate text-foreground">{profile}</span>
                <span className="text-right text-foreground">{score}</span>
                <span
                  className={
                    status === "fulfilled" ? "text-success" : "text-destructive"
                  }
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.stage} ${styles.csvDetail}`}>
          <PreviewHeader
            description="Open one result and inspect the score contributors."
            label="Batch CSV evaluation"
            status="expanded"
            title="APP-002 scoring detail"
          />
          <div className="mt-4 rounded-md border border-border bg-muted p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Growth profile
                </p>
                <p className="text-[0.68rem] text-muted-foreground">
                  Normalized score 91
                </p>
              </div>
              <span className="rounded-full bg-accent px-2 py-1 text-[0.62rem] font-semibold text-accent-foreground">
                selected
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                ["Risk attitude", "24"],
                ["Horizon", "20"],
                ["Experience", "18"],
                ["Liquidity", "12"],
              ].map(([label, score]) => (
                <div key={label}>
                  <div className="flex justify-between text-[0.68rem]">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{score}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-background">
                    <div
                      className={`${styles.scoreMeter} h-full rounded-full bg-primary`}
                      style={{
                        width: `${Number(score) * 3.4}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <FeatureIntro
          className={`${styles.stage} ${styles.definitionIntro}`}
          description="Design questions, assign option weights, and apply a policy-specific model."
          title="Custom definition design"
        />

        <div className={`${styles.stage} ${styles.definitionEdit}`}>
          <PreviewHeader
            description="Design a custom questionnaire item and scoring options."
            label="Custom definition"
            status="editing"
            title="Market drawdown reaction"
          />
          <div className="mt-4 rounded-md border border-border bg-card p-3">
            <p className="text-xs font-semibold text-foreground">
              How would you react to a 20% market drop?
            </p>
            <div className="mt-3 grid gap-2">
              {[
                ["Sell to preserve capital", "0 pts"],
                ["Hold and rebalance", "12 pts"],
                ["Buy more at lower prices", "24 pts"],
              ].map(([option, weight]) => (
                <div
                  className="flex items-center justify-between rounded border border-border bg-muted px-2 py-2 text-[0.68rem]"
                  key={option}
                >
                  <span className="text-foreground">{option}</span>
                  <span className="font-medium text-muted-foreground">
                    {weight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${styles.stage} ${styles.definitionApply}`}>
          <PreviewHeader
            description="Validate the graph contract and apply the active model."
            label="Custom definition"
            status="applied"
            title="Definition saved"
          />
          <div className="mt-4 grid gap-3">
            <div className="rounded-md border border-border bg-muted p-3">
              <p className="text-xs font-semibold text-success">Schema valid</p>
              <p className="mt-1 text-[0.68rem] text-muted-foreground">
                Questions, score bands, overrides, and allocations passed graph
                validation.
              </p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-xs font-semibold text-foreground">
                Active definition updated
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`${styles.meter} h-full rounded-full bg-accent`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.stage} ${styles.definitionEvaluate}`}>
          <PreviewHeader
            description="Run the same CSV batch against the customized model."
            label="Custom definition"
            status="evaluating"
            title="Re-evaluating applicants"
          />
          <div className="mt-4 grid gap-2">
            {evaluationSteps.map((item) => (
              <div
                className="flex items-center justify-between rounded-md border border-border bg-muted px-3 py-2"
                key={item}
              >
                <span className="text-xs text-foreground">{item}</span>
                <EvaluationState />
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.stage} ${styles.definitionResults}`}>
          <PreviewHeader
            description="Compare updated profiles after applying the custom rule."
            label="Custom definition"
            status="complete"
            title="Updated batch result"
          />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ["5", "rows"],
              ["4", "fulfilled"],
              ["1", "rejected"],
            ].map(([value, label]) => (
              <div
                className="rounded-md border border-border bg-muted p-2"
                key={label}
              >
                <p className="text-lg font-semibold text-foreground">{value}</p>
                <p className="text-[0.62rem] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-1.5 font-mono text-[0.62rem]">
            {customizedResults.map(([id, profile, score, status], index) => (
              <div
                className={`${styles.item} grid grid-cols-[52px_1fr_32px_56px] items-center gap-2 rounded bg-muted px-2 py-1.5`}
                key={id}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <span className="text-muted-foreground">{id}</span>
                <span className="truncate text-foreground">{profile}</span>
                <span className="text-right text-foreground">{score}</span>
                <span
                  className={
                    status === "fulfilled" ? "text-success" : "text-destructive"
                  }
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureIntro({
  className,
  description,
  title,
}: {
  readonly className: string;
  readonly description: string;
  readonly title: string;
}) {
  return (
    <div className={className}>
      <div className="flex h-full items-center justify-center text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            {title}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">
            See the workflow in action.
          </h3>
          <p className="mx-auto mt-2 max-w-64 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function EvaluationState() {
  return (
    <span className="text-[0.65rem] font-semibold text-success">done</span>
  );
}

function PreviewHeader({
  description,
  label,
  status,
  title,
}: {
  readonly description: string;
  readonly label: string;
  readonly status: string;
  readonly title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[0.62rem] font-bold uppercase tracking-wide text-primary">
          {label}
        </p>
        <h3 className="mt-1 text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-[0.68rem] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <span className="rounded-full bg-card px-2 py-1 text-[0.62rem] font-semibold text-muted-foreground">
        {status}
      </span>
    </div>
  );
}
