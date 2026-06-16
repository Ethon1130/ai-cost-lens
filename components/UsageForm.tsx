import type { UsageInput } from "@/lib/calculate";

interface UsageFormProps {
  usage: UsageInput;
  onChange: (usage: UsageInput) => void;
}

interface FieldProps {
  id: keyof UsageInput;
  label: string;
  hint: string;
  min?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

function NumberField({
  id,
  label,
  hint,
  min = 0,
  step = 1,
  value,
  onChange,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={`field-${id}`}
        className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
      >
        {label}
      </label>
      <input
        id={`field-${id}`}
        type="number"
        inputMode="numeric"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const raw = e.target.value;
          const num = Number(raw);
          onChange(Number.isFinite(num) && num >= 0 ? num : 0);
        }}
        className={[
          "w-full rounded-lg border px-3 py-2 text-sm tabular-nums",
          "border-zinc-300 bg-white text-zinc-900",
          "focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900",
          "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100",
          "dark:focus:border-zinc-300 dark:focus:ring-zinc-300",
        ].join(" ")}
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>
    </div>
  );
}

export function UsageForm({ usage, onChange }: UsageFormProps) {
  return (
    <section aria-labelledby="usage-heading" className="space-y-3">
      <div>
        <h2
          id="usage-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          2. Adjust usage assumptions
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          All inputs are sanitized to non-negative numbers. Empty or invalid
          values fall back to 0 — the calculator will never show NaN.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          id="dailyUsers"
          label="Daily active users"
          hint="How many unique users hit your AI feature per day."
          value={usage.dailyUsers}
          onChange={(v) => onChange({ ...usage, dailyUsers: v })}
        />
        <NumberField
          id="requestsPerUserPerDay"
          label="Requests per user / day"
          hint="Average number of model calls each user makes per day."
          value={usage.requestsPerUserPerDay}
          onChange={(v) => onChange({ ...usage, requestsPerUserPerDay: v })}
        />
        <NumberField
          id="avgInputTokens"
          label="Avg input tokens / request"
          hint="System prompt + user message + retrieved context."
          value={usage.avgInputTokens}
          onChange={(v) => onChange({ ...usage, avgInputTokens: v })}
        />
        <NumberField
          id="avgOutputTokens"
          label="Avg output tokens / request"
          hint="Tokens the model generates per response."
          value={usage.avgOutputTokens}
          onChange={(v) => onChange({ ...usage, avgOutputTokens: v })}
        />
      </div>
    </section>
  );
}
