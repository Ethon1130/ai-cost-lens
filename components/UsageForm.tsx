import { useState } from "react";
import type { UsageInput } from "@/lib/calculate";
import type { AppCopy } from "@/lib/i18n";
import { toSafeNumber } from "@/lib/safeNumber";
import { RetryRateSlider } from "./RetryRateSlider";

interface UsageFormProps {
  usage: UsageInput;
  copy: AppCopy["usage"];
  onChange: (usage: UsageInput) => void;
}

interface FieldProps {
  id: "requestsPerDay" | "daysPerMonth" | "activeUsers";
  label: string;
  hint: string;
  min?: number;
  max?: number;
  integer?: boolean;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

function NumberField({
  id,
  label,
  hint,
  min = 0,
  max,
  integer,
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
        inputMode="decimal"
        min={min}
        step={step}
        value={Number.isFinite(value) && value > 0 ? value : ""}
        onChange={(e) =>
          onChange(toSafeNumber(e.target.value, 0, { min, max, integer }))
        }
        className={[
          "w-full rounded-lg border px-3 py-2 text-sm tabular-nums placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
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

export function UsageForm({ usage, copy, onChange }: UsageFormProps) {
  const [showActiveUsers, setShowActiveUsers] = useState(false);

  return (
    <section aria-labelledby="usage-heading" className="space-y-3">
      <div>
        <h2
          id="usage-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {copy.heading}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {copy.description}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          id="requestsPerDay"
          label={copy.requestsPerDay}
          hint={copy.requestsPerDayHint}
          value={usage.requestsPerDay}
          onChange={(v) => onChange({ ...usage, requestsPerDay: v })}
        />
        <NumberField
          id="daysPerMonth"
          label={copy.daysPerMonth}
          hint={copy.daysPerMonthHint}
          value={usage.daysPerMonth}
          max={31}
          integer
          onChange={(v) => onChange({ ...usage, daysPerMonth: v })}
        />
      </div>
      <RetryRateSlider
        value={usage.retryRate}
        onChange={(v) => onChange({ ...usage, retryRate: v })}
        copy={{ label: copy.retryRate, hint: copy.retryRateHint }}
      />
      {/* Active Users Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="toggle-active-users"
          checked={showActiveUsers}
          onChange={(e) => setShowActiveUsers(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-blue-400 dark:focus:ring-blue-400 cursor-pointer"
        />
        <label
          htmlFor="toggle-active-users"
          className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer"
        >
          {copy.activeUsers}
        </label>
      </div>
      {showActiveUsers && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            id="activeUsers"
            label={copy.activeUsers}
            hint={copy.activeUsersHint}
            value={usage.activeUsers}
            onChange={(v) => onChange({ ...usage, activeUsers: v })}
          />
        </div>
      )}
    </section>
  );
}
