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
}

export function CostSummary({ report, copy, currency, exchangeRate, models }: CostSummaryProps) {
  const cheapest = report.cheapestModelId
    ? models.find((m) => m.model === report.cheapestModelId)
    : null;
  const cheapestBreakdown = report.models.find(
    (b) => b.model.model === report.cheapestModelId,
  );
  const hasTraffic = report.monthlyRequests > 0;

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
          </span>
        ) : null}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
        <Metric
          label={copy.monthlyCost}
          value={formatCurrency(report.cheapestTotalCost, currency, exchangeRate)}
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
