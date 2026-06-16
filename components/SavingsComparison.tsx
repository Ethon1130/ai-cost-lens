import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/calculate";
import type { CostReport } from "@/lib/calculate";
import type { Currency } from "@/lib/currency";
import type { AppCopy } from "@/lib/i18n";

interface SavingsComparisonProps {
  report: CostReport;
  copy: AppCopy["savings"];
  currency: Currency;
  exchangeRate: number;
}

export function SavingsComparison({ report, copy, currency, exchangeRate }: SavingsComparisonProps) {
  const [baselineKey, setBaselineKey] = useState<string | null>(null);

  const options = useMemo(
    () =>
      report.models.map((breakdown, index) => ({
        key: `${index}:${breakdown.model.model}`,
        breakdown,
      })),
    [report.models],
  );

  const positiveOptions = useMemo(
    () => options.filter(({ breakdown }) => breakdown.totalCost > 0),
    [options],
  );

  const defaultBaselineKey = useMemo(() => {
    let mostExpensive = positiveOptions[0] ?? null;
    for (const option of positiveOptions) {
      if (
        !mostExpensive ||
        option.breakdown.totalCost > mostExpensive.breakdown.totalCost
      ) {
        mostExpensive = option;
      }
    }
    return mostExpensive?.key ?? options[0]?.key ?? null;
  }, [options, positiveOptions]);

  const effectiveBaselineKey =
    baselineKey && options.some((option) => option.key === baselineKey)
      ? baselineKey
      : defaultBaselineKey;

  const cheapest = useMemo(() => {
    let best = positiveOptions[0]?.breakdown ?? null;
    for (const { breakdown } of positiveOptions) {
      if (!best || breakdown.totalCost < best.totalCost) best = breakdown;
    }
    return best;
  }, [positiveOptions]);

  const baseline =
    options.find((option) => option.key === effectiveBaselineKey)?.breakdown ??
    positiveOptions[0]?.breakdown ??
    null;
  const savingsAmount =
    baseline && cheapest
      ? Math.max(baseline.totalCost - cheapest.totalCost, 0)
      : 0;
  const savingsPercent =
    baseline && baseline.totalCost > 0
      ? savingsAmount / baseline.totalCost
      : 0;
  const hasSavings = Boolean(baseline && cheapest && savingsAmount > 0);
  const noEstimatedSavings = copy.noEstimatedSavings ?? copy.noPaidTraffic;
  const result = hasSavings && cheapest
    ? (copy.result ?? "{model} may save {amount}/mo")
        .replace("{model}", cheapest.model.displayName)
        .replace(
          "{amount}",
          formatCurrency(savingsAmount, currency, exchangeRate),
        )
    : noEstimatedSavings;
  const isDisabled = positiveOptions.length === 0;

  return (
    <section
      aria-labelledby="savings-heading"
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="savings-heading"
            className="text-base font-semibold text-emerald-950 dark:text-emerald-100"
          >
            {copy.heading}
          </h2>
          <p className="mt-1 text-sm text-emerald-900/80 dark:text-emerald-200/80">
            {copy.description}
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-emerald-950 dark:text-emerald-100 sm:min-w-64">
          {copy.comparedWith ?? copy.comparison}
          <select
            value={effectiveBaselineKey ?? ""}
            disabled={isDisabled}
            onChange={(event) => setBaselineKey(event.target.value)}
            className="min-h-10 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm text-emerald-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
          >
            {options.map(({ key, breakdown }) => (
              <option key={key} value={key}>
                {breakdown.model.displayName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          label={copy.monthlySavings}
          value={formatCurrency(savingsAmount, currency, exchangeRate)}
        />
        <Metric
          label={copy.percentSavings}
          value={formatSavingsPercent(savingsPercent)}
        />
        <Metric
          label={copy.comparison}
          value={result}
        />
      </div>
      {(copy.caveat ?? copy.description) ? (
        <p className="mt-3 text-xs text-emerald-900/70 dark:text-emerald-200/70">
          {copy.caveat ?? copy.description}
        </p>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/70 p-3 dark:bg-black/20">
      <div className="text-xs uppercase text-emerald-900/70 dark:text-emerald-200/70">
        {label}
      </div>
      <div className="mt-1 break-words text-lg font-semibold tabular-nums text-emerald-950 dark:text-emerald-100">
        {value}
      </div>
    </div>
  );
}

function formatSavingsPercent(value: number): string {
  const safeValue = Number.isFinite(value) ? Math.max(value, 0) : 0;
  if (safeValue >= 0.9995) return ">99.9%";
  return `${(safeValue * 100).toFixed(1)}%`;
}
