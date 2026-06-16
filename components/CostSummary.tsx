import {
  formatRequests,
  formatTokens,
  formatUsd,
} from "@/lib/calculate";
import type { CostReport } from "@/lib/calculate";
import { MODELS } from "@/lib/pricing";

interface CostSummaryProps {
  report: CostReport;
}

export function CostSummary({ report }: CostSummaryProps) {
  const cheapest = report.cheapestModelId
    ? MODELS.find((m) => m.model === report.cheapestModelId)
    : null;
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
            3. Quick summary
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Full breakdown follows below. All amounts are USD and assume the
            current pricing snapshot.
          </p>
        </div>
        {cheapest ? (
          <span
            className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
            title="Lowest monthly total cost across the snapshot models."
          >
            Cheapest: {cheapest.displayName}
          </span>
        ) : null}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/60">
          <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Monthly requests
          </dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {formatRequests(report.monthlyRequests)}
          </dd>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/60">
          <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Input tokens / mo
          </dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {formatTokens(report.monthlyInputTokens)}
          </dd>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/60">
          <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Output tokens / mo
          </dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {formatTokens(report.monthlyOutputTokens)}
          </dd>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/60">
          <dt className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Models compared
          </dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {report.models.length}
          </dd>
        </div>
      </dl>
      <p
        className={[
          "text-xs",
          hasTraffic
            ? "text-zinc-500 dark:text-zinc-500"
            : "text-amber-700 dark:text-amber-400",
        ].join(" ")}
      >
        {hasTraffic
          ? "Costs are estimates based on the snapshot prices below. They do not include free tiers, taxes, enterprise discounts, or rate limits."
          : "Enter some traffic in step 2 to see real numbers."}
      </p>
    </section>
  );
}
