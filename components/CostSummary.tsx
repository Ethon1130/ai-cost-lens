import { useMemo } from "react";
import {
  formatRequests,
  formatTokens,
  formatCurrency,
} from "@/lib/calculate";
import type { CostReport } from "@/lib/calculate";
import type { Currency } from "@/lib/currency";
import type { AppCopy } from "@/lib/i18n";
import type { ModelPrice } from "@/lib/pricing";

// TODO(P0): CostSummary 增加「成本构成概览」—— 在 Unit Economics 卡片下方新增一行小卡片：
//   inputCost / outputCost / cachedInputCost / retryCost / fxImpact 各占多少。
//   用色块进度条可视化各部分占比（例如 output 占 72% 时显示红色提示）。
// TODO(P0): CostSummary 增加「成本优化建议入口 banner」，在表格底部添加一行：
//   "输出 token 占总成本 72%，建议限制 max_tokens / 考虑更短摘要策略"（来自 lib/recommendations.ts）。
// TODO(P1): CostSummary 增加「实时 vs 批处理」对比行，显示 batch 模式成本和节省 %。

interface CostSummaryProps {
  report: CostReport;
  copy: AppCopy["summary"];
  currency: Currency;
  exchangeRate: number;
  models: ModelPrice[];
  /** Optional provider filter (e.g. from the cost table). When non-empty, the
   *  "Cheapest" indicator and unit-economics numbers are derived from the
   *  filtered subset instead of the global set. */
  selectedProviders?: string[];
  /** Optional free-text search filter, matched against displayName / model / provider. */
  searchQuery?: string;
  /** Copy for the "in view" qualifier shown on the cheapest badge. */
  filterCopy?: {
    inView: string;
    allModels?: string;
  };
}

export function CostSummary({
  report,
  copy,
  currency,
  exchangeRate,
  models,
  selectedProviders = [],
  searchQuery = "",
  filterCopy,
}: CostSummaryProps) {
  // Derive the "cheapest" indicator from the user-visible subset so it stays
  // meaningful when the cost table is filtered by provider / search query.
  // Falls back to the report's global cheapest when no filter is active.
  const visibleModels = useMemo(() => {
    let list = report.models;
    if (selectedProviders.length > 0) {
      list = list.filter((b) => selectedProviders.includes(b.model.provider));
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.model.displayName.toLowerCase().includes(q) ||
          b.model.model.toLowerCase().includes(q) ||
          b.model.provider.toLowerCase().includes(q),
      );
    }
    return list;
  }, [report.models, selectedProviders, searchQuery]);

  const visibleCheapest = useMemo(() => {
    if (visibleModels.length === 0) return null;
    return visibleModels.reduce((min, b) =>
      b.totalCost < min.totalCost ? b : min,
    );
  }, [visibleModels]);

  const isFiltered = selectedProviders.length > 0 || searchQuery.trim().length > 0;
  // When a filter is active and yields zero matches, surface a clear empty
  // state instead of silently falling back to the global cheapest (which
  // would mislead the user about what they're looking at).
  const showEmpty = isFiltered && visibleModels.length === 0;
  const cheapestBreakdown = showEmpty
    ? null
    : visibleCheapest ?? report.models.find(
        (b) => b.model.model === report.cheapestModelId,
      );
  const cheapest = cheapestBreakdown
    ? models.find((m) => m.model === cheapestBreakdown.model.model) ?? null
    : null;
  const hasTraffic = report.monthlyRequests > 0;
  const cheapestMonthlyCost = cheapestBreakdown?.totalCost ?? report.cheapestTotalCost;

  return (
    <section
      aria-labelledby="summary-heading"
      className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="summary-heading"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
            {copy.heading}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {copy.description}
          </p>
        </div>
        {cheapest ? (
          <span
            className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
            title={copy.cheapestTitle}
          >
            {copy.cheapest}: {cheapest.displayName}
            {isFiltered && filterCopy ? (
              <span className="ml-1 text-[10px] font-normal opacity-80">
                ({filterCopy.inView})
              </span>
            ) : null}
          </span>
        ) : showEmpty && filterCopy ? (
          <span
            className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
            title={copy.cheapestTitle}
          >
            {copy.cheapest}: —
          </span>
        ) : null}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
        <Metric
          label={copy.monthlyCost}
          value={formatCurrency(cheapestMonthlyCost, currency, exchangeRate)}
        />
        <Metric
          label={copy.costPerRequest}
          value={formatCurrency(cheapestBreakdown?.costPerRequest ?? 0, currency, exchangeRate)}
        />
        <Metric
          label={copy.costPer1KRequests}
          value={formatCurrency(cheapestBreakdown?.costPer1KRequests ?? 0, currency, exchangeRate)}
        />
        <Metric
          label={copy.costPerUserPerMonth}
          value={formatCurrency(cheapestBreakdown?.costPerActiveUserPerMonth ?? 0, currency, exchangeRate)}
        />
      </dl>
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <Metric
          label={copy.monthlyRequests}
          value={formatRequests(report.monthlyRequests)}
        />
        <Metric
          label={copy.inputTokensPerMonth}
          value={formatTokens(report.monthlyInputTokens)}
        />
        <Metric
          label={copy.outputTokensPerMonth}
          value={formatTokens(report.monthlyOutputTokens)}
        />
      </dl>
      <p
        className={[
          "text-xs",
          hasTraffic
            ? "text-zinc-500 dark:text-zinc-500"
            : "text-amber-700 dark:text-amber-400",
        ].join(" ")}
      >
        {hasTraffic ? copy.estimateNote : copy.noTraffic}
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
