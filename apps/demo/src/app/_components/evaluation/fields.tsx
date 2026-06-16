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
      className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      type={type}
      disabled={disabled}
    >
      {disabled ? loadingLabel : label}
    </button>
  );
}

export function TextField({
  defaultValue,
  label,
  name,
}: {
  readonly defaultValue: string;
  readonly label: string;
  readonly name: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        defaultValue={defaultValue}
        name={name}
        required
        type="text"
      />
    </label>
  );
}

export function NumberField({
  defaultValue,
  label,
  max,
  min,
  name,
  prefix,
  suffix,
}: {
  readonly defaultValue: number;
  readonly label: string;
  readonly max?: number;
  readonly min: number;
  readonly name: string;
  readonly prefix?: string;
  readonly suffix?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <span className="mt-2 flex h-11 items-center rounded-md border border-slate-300 bg-white focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200">
        {prefix && (
          <span className="pl-3 text-sm font-normal text-slate-500">
            {prefix}
          </span>
        )}
        <input
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-950 outline-none"
          defaultValue={defaultValue}
          max={max}
          min={min}
          name={name}
          required
          type="number"
        />
        {suffix && (
          <span className="pr-3 text-sm font-normal text-slate-500">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

export function SelectField({
  defaultValue,
  label,
  name,
  options,
}: {
  readonly defaultValue: string;
  readonly label: string;
  readonly name: string;
  readonly options: readonly SelectOption[];
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <select
        className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
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
    </label>
  );
}
