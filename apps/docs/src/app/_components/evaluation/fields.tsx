import type { SelectOption } from "./demo-data";

export function Button({
  disabled,
  label,
  loadingLabel,
  type,
}: {
  readonly disabled: boolean;
  readonly label: string;
  readonly loadingLabel: string;
  readonly type: "button" | "submit";
}) {
  return (
    <button
      className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted"
      type={type}
      disabled={disabled}
    >
      {disabled ? loadingLabel : label}
    </button>
  );
}

export function TextField({
  defaultValue,
  hint,
  label,
  name,
}: {
  readonly defaultValue: string;
  readonly hint?: string;
  readonly label: string;
  readonly name: string;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <input
        className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
        defaultValue={defaultValue}
        name={name}
        required
        type="text"
      />
      {hint && (
        <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}

export function NumberField({
  defaultValue,
  hint,
  label,
  max,
  min,
  name,
  prefix,
  step = 1,
  suffix,
}: {
  readonly defaultValue: number;
  readonly hint?: string;
  readonly label: string;
  readonly max?: number;
  readonly min: number;
  readonly name: string;
  readonly prefix?: string;
  readonly step?: number | "any";
  readonly suffix?: string;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <span className="mt-2 flex h-11 items-center rounded-md border border-input bg-card focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25">
        {prefix && (
          <span className="pl-3 text-sm font-normal text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none"
          defaultValue={defaultValue}
          max={max}
          min={min}
          name={name}
          required
          step={step}
          type="number"
        />
        {suffix && (
          <span className="pr-3 text-sm font-normal text-muted-foreground">
            {suffix}
          </span>
        )}
      </span>
      <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">
        {hint ?? formatNumberHint(min, max)}
      </span>
    </label>
  );
}

export function SelectField({
  defaultValue,
  hint,
  label,
  name,
  options,
}: {
  readonly defaultValue: string;
  readonly hint?: string;
  readonly label: string;
  readonly name: string;
  readonly options: readonly SelectOption[];
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <select
        className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
        defaultValue={defaultValue}
        name={name}
        required
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && (
        <span className="mt-1.5 block text-xs font-normal leading-5 text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}

function formatNumberHint(min: number, max: number | undefined): string {
  if (max === undefined) return `Minimum ${min}.`;
  return `Allowed range ${min}-${max}.`;
}
