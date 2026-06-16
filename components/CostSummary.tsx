import {
  formatRequests,
  formatTokens,
  formatUsd,
} from "@/lib/calculate";
import type { CostReport } from "@/lib/calculate";
import type { AppCopy } from "@/lib/i18n";
import { MODELS } from "@/lib/pricing";

interface CostSummaryProps {
  report: CostReport;
  copy: AppCopy["summary"];
}

export function CostSummary({ report, copy }: CostSummaryProps) {
  const cheapest = report.cheapestModelId
    ? MODELS.find((m) => m.model === report.cheapestModelId)
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
          value={formatUsd(report.cheapestTotalCost)}
        />
        <Metric
          label={copy.costPerRequest}
          value={formatUsd(cheapestBreakdown?.costPerRequest ?? 0)}
        />
        <Metric
          label={copy.costPer1KRequests}
          value={formatUsd(cheapestBreakdown?.costPer1KRequests ?? 0)}
        />
        <Metric
          label={copy.costPerUserPerMonth}
          value={formatUsd(cheapestBreakdown?.costPerActiveUserPerMonth ?? 0)}
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
