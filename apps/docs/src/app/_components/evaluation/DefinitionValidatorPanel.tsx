import { useState } from "react";
import type { RiskProfileDefinition } from "@zagvar/helm-types";
import { ErrorDetails } from "./ErrorDetails";
import { Button } from "./fields";
import {
  errorFromResponse,
  parseJsonInput,
  toApiError,
} from "./requests";
import type { ApiError } from "./requests";

type ValidationState =
  | { readonly status: "idle" }
  | { readonly status: "valid"; readonly message: string }
  | { readonly status: "invalid"; readonly error: ApiError };

export function DefinitionValidatorPanel({
  initialDefinition,
}: {
  readonly initialDefinition: RiskProfileDefinition;
}) {
  const [definitionJson, setDefinitionJson] = useState(() =>
    JSON.stringify(initialDefinition, null, 2),
  );
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setValidation({ status: "idle" });

    try {
      const input = parseJsonInput(definitionJson, "Definition JSON");
      const response = await fetch("/api/definitions/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const data = await response.json();

      if (!response.ok || data.valid !== true) {
        setValidation({
          status: "invalid",
          error: errorFromResponse(data, "Definition validation failed."),
        });
        return;
      }

      setValidation({
        status: "valid",
        message: "Definition is valid.",
      });
    } catch (err) {
      setValidation({
        status: "invalid",
        error: toApiError(err, "Definition validation failed."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <form
        onSubmit={handleSubmit}
        className="min-w-0 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="border-b border-border pb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Definition Validator
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Paste a custom definition to validate it against the public Helm
            definition contract.
          </p>
        </div>

        <label className="mt-6 block text-sm font-medium text-foreground">
          Definition JSON
          <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">
            Use this to check a definition before storing it or evaluating
            applicants with it.
          </span>
          <textarea
            className="mt-2 min-h-96 w-full rounded-md border border-input bg-code p-4 font-mono text-xs leading-5 text-code-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            value={definitionJson}
            onChange={(event) => setDefinitionJson(event.target.value)}
            spellCheck={false}
          />
        </label>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
          <Button
            disabled={isSubmitting}
            label="Validate definition"
            loadingLabel="Validating..."
            type="submit"
          />
          {validation.status === "valid" && (
            <p
              className="text-sm font-medium text-success"
              role="status"
            >
              {validation.message}
            </p>
          )}
          {validation.status === "invalid" && (
            <ErrorDetails error={validation.error} />
          )}
        </div>
      </form>

      <aside className="min-w-0 rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">
          What Is Checked
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
          <li>Question IDs, types, options, and required flags.</li>
          <li>Scoring rules, weights, and range coverage.</li>
          <li>Profiles, score bands, and allocation totals.</li>
          <li>Override references and profile IDs.</li>
        </ul>
      </aside>
    </section>
  );
}
