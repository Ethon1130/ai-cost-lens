import {
  formatPercent,
  formatCurrency,
} from "@/lib/calculate";
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
  const from = report.models.find(
    (b) => b.model.model === report.savingsIfSwitchToCheapest.fromModelId,
  );
  const to = report.models.find(
    (b) => b.model.model === report.savingsIfSwitchToCheapest.toModelId,
  );
  const hasSavings =
    Boolean(from && to) && report.savingsIfSwitchToCheapest.amount > 0;

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
        {to ? (
          <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-medium text-white dark:bg-emerald-500 dark:text-emerald-950">
            {copy.cheapest}: {to.model.displayName}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          label={copy.monthlySavings}
          value={formatCurrency(report.savingsIfSwitchToCheapest.amount, currency, exchangeRate)}
        />
        <Metric
          label={copy.percentSavings}
          value={formatPercent(report.savingsIfSwitchToCheapest.percent)}
        />
        <Metric
          label={copy.comparison}
          value={
            hasSavings && from && to
              ? `${from.model.displayName} ${copy.to} ${to.model.displayName}`
              : copy.noPaidTraffic
          }
        />
      </div>
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
