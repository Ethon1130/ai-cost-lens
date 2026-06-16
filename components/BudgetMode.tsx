import {
  formatRequests,
  formatTokens,
  formatCurrency,
} from "@/lib/calculate";
import type { BudgetReport } from "@/lib/calculate";
import type { Currency } from "@/lib/currency";
import type { AppCopy } from "@/lib/i18n";
import { toSafeNumber } from "@/lib/safeNumber";

interface BudgetModeProps {
  budget: number;
  report: BudgetReport;
  copy: AppCopy["budget"];
  onBudgetChange: (budget: number) => void;
  currency: Currency;
  exchangeRate: number;
}
// TODO(P0): BudgetMode 输出中新增「预算反推 DAU / 请求量」区块：
//   在最佳模型 maxRequests 基础上，反推：
//     estimatedDAU = floor(maxRequests / requestsPerDay / daysPerMonth)
//     estimatedRequestsPerUserPerDay = floor(maxRequests / estimatedDAU / daysPerMonth)
//     monthlyRequests = maxRequests
//   显示在表格下方的「Derived metrics」区块，带 currency 格式化。

export function BudgetMode({
  budget,
  report,
  copy,
  onBudgetChange,
  currency,
  exchangeRate,
}: BudgetModeProps) {
  const topRequests = report.models[0]?.maxRequests ?? 0;
  const bestValue = report.models.find(
    (b) => b.model.model === report.bestValueModelId,
  );
  const hasRunway =
    report.monthlyBudget > 0 &&
    report.avgInputTokens + report.avgOutputTokens > 0 &&
    topRequests > 0;

  return (
    <section
      aria-labelledby="budget-heading"
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="budget-heading"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {copy.heading}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {copy.description}
          </p>
        </div>
        {bestValue ? (
          <span
            className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
            title={copy.bestValueTitle}
          >
            {copy.bestValue}: {bestValue.model.displayName}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="field-monthlyBudget"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            {copy.monthlyBudget}
          </label>
          <input
            id="field-monthlyBudget"
            type="number"
            inputMode="decimal"
            min={0}
            step={1}
            value={Number.isFinite(budget) ? budget : 0}
            onChange={(e) =>
              onBudgetChange(toSafeNumber(e.target.value, 0))
            }
            className={[
              "w-full rounded-lg border px-3 py-2 text-sm tabular-nums",
              "border-zinc-300 bg-white text-zinc-900",
              "focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900",
              "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100",
              "dark:focus:border-zinc-300 dark:focus:ring-zinc-300",
            ].join(" ")}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            {copy.monthlyBudgetHint}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric
            label={copy.maxRequests}
            value={formatRequests(report.bestValueRequests)}
          />
          <Metric
            label={copy.costPerRequest}
            value={formatCurrency(bestValue?.costPerRequest ?? 0, currency, exchangeRate)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {copy.ranking}
        </h3>
        <div className="space-y-2">
          {report.models.map((item) => {
            const isBest = item.model.model === report.bestValueModelId;
            const width =
              topRequests > 0
                ? Math.max((item.maxRequests / topRequests) * 100, 2)
                : 0;

            return (
              <div
                key={item.model.model}
                className={[
                  "rounded-lg border p-3",
                  isBest
                    ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-900/20"
                    : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50",
                ].join(" ")}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {item.model.displayName}
                      </span>
                      {isBest ? (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          {copy.bestValue}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      {item.model.provider}
                    </p>
                  </div>
                  <div className="text-left text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 sm:text-right">
                    {formatRequests(item.maxRequests)}
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                {copy.model}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {copy.provider}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                {copy.maxRequests}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                {copy.costPerRequest}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                {copy.costPer1KRequests}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                {copy.estimatedSpend}
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                {copy.unusedBudget}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {report.models.map((item) => {
              const isBest = item.model.model === report.bestValueModelId;
              return (
                <tr
                  key={item.model.model}
                  className={
                    isBest
                      ? "bg-emerald-50/60 dark:bg-emerald-900/20"
                      : "bg-white dark:bg-zinc-950"
                  }
                >
                  <th
                    scope="row"
                    className="whitespace-nowrap px-4 py-3 text-left font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    {item.model.displayName}
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {item.model.provider}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatRequests(item.maxRequests)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(item.costPerRequest, currency, exchangeRate)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(item.costPer1KRequests, currency, exchangeRate)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(item.estimatedSpend, currency, exchangeRate)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatCurrency(item.unusedBudget, currency, exchangeRate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Metric
          label={copy.avgInputTokens}
          value={formatTokens(report.avgInputTokens)}
        />
        <Metric
          label={copy.avgOutputTokens}
          value={formatTokens(report.avgOutputTokens)}
        />
        <Metric label={copy.budgetLabel} value={formatCurrency(report.monthlyBudget, currency, exchangeRate)} />
        <Metric
          label={copy.bestValue}
          value={formatRequests(report.bestValueRequests)}
        />
      </dl>

      <p
        className={[
          "text-xs",
          hasRunway
            ? "text-zinc-500 dark:text-zinc-500"
            : "text-amber-700 dark:text-amber-400",
        ].join(" ")}
      >
        {hasRunway ? copy.note : copy.noBudget}
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/60">
      <dt className="text-xs uppercase text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}
