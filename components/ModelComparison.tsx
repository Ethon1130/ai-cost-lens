import { formatCurrency, formatPercent } from "@/lib/calculate";
import type { CostReport } from "@/lib/calculate";
import type { Currency } from "@/lib/currency";
import type { AppCopy } from "@/lib/i18n";

interface ModelComparisonProps {
  report: CostReport;
  copy: AppCopy["comparison"];
  currency: Currency;
  exchangeRate: number;
  selectedModelIds: string[];
  onClear: () => void;
}

export function ModelComparison({
  report,
  copy,
  currency,
  exchangeRate,
  selectedModelIds,
  onClear,
}: ModelComparisonProps) {
  if (selectedModelIds.length !== 2) {
    return null;
  }

  const [modelAId, modelBId] = selectedModelIds;
  const modelA = report.models.find((m) => m.model.model === modelAId);
  const modelB = report.models.find((m) => m.model.model === modelBId);

  if (!modelA || !modelB) {
    return null;
  }

  const costDiff = modelA.totalCost - modelB.totalCost;
  const costDiffAbs = Math.abs(costDiff);
  const costDiffPercent =
    Math.min(modelA.totalCost, modelB.totalCost) > 0
      ? (costDiffAbs /
          Math.max(modelA.totalCost, modelB.totalCost))
      : 0;
  const cheaper = modelA.totalCost <= modelB.totalCost ? modelA : modelB;
  const moreExpensive =
    modelA.totalCost > modelB.totalCost ? modelA : modelB;

  const rows: Array<{
    label: string;
    valueA: string;
    valueB: string;
    diff?: string;
    diffPercent?: string;
    highlight?: "a" | "b" | null;
  }> = [
    {
      label: copy.inputCost,
      valueA: formatCurrency(modelA.inputCost, currency, exchangeRate),
      valueB: formatCurrency(modelB.inputCost, currency, exchangeRate),
      diff: formatCurrency(
        modelA.inputCost - modelB.inputCost,
        currency,
        exchangeRate,
      ),
      highlight:
        modelA.inputCost < modelB.inputCost
          ? "a"
          : modelA.inputCost > modelB.inputCost
            ? "b"
            : null,
    },
    {
      label: copy.outputCost,
      valueA: formatCurrency(modelA.outputCost, currency, exchangeRate),
      valueB: formatCurrency(modelB.outputCost, currency, exchangeRate),
      diff: formatCurrency(
        modelA.outputCost - modelB.outputCost,
        currency,
        exchangeRate,
      ),
      highlight:
        modelA.outputCost < modelB.outputCost
          ? "a"
          : modelA.outputCost > modelB.outputCost
            ? "b"
            : null,
    },
    {
      label: copy.totalCost,
      valueA: formatCurrency(modelA.totalCost, currency, exchangeRate),
      valueB: formatCurrency(modelB.totalCost, currency, exchangeRate),
      diff: formatCurrency(costDiff, currency, exchangeRate),
      diffPercent: formatPercent(costDiffPercent),
      highlight:
        modelA.totalCost < modelB.totalCost
          ? "a"
          : modelA.totalCost > modelB.totalCost
            ? "b"
            : null,
    },
    {
      label: copy.costPerRequest,
      valueA: formatCurrency(modelA.costPerRequest, currency, exchangeRate),
      valueB: formatCurrency(modelB.costPerRequest, currency, exchangeRate),
      highlight:
        modelA.costPerRequest < modelB.costPerRequest
          ? "a"
          : modelA.costPerRequest > modelB.costPerRequest
            ? "b"
            : null,
    },
    {
      label: copy.costPer1KRequests,
      valueA: formatCurrency(modelA.costPer1KRequests, currency, exchangeRate),
      valueB: formatCurrency(modelB.costPer1KRequests, currency, exchangeRate),
      highlight:
        modelA.costPer1KRequests < modelB.costPer1KRequests
          ? "a"
          : modelA.costPer1KRequests > modelB.costPer1KRequests
            ? "b"
            : null,
    },
    {
      label: copy.costPerUserPerMonth,
      valueA: formatCurrency(
        modelA.costPerActiveUserPerMonth,
        currency,
        exchangeRate,
      ),
      valueB: formatCurrency(
        modelB.costPerActiveUserPerMonth,
        currency,
        exchangeRate,
      ),
      highlight:
        modelA.costPerActiveUserPerMonth < modelB.costPerActiveUserPerMonth
          ? "a"
          : modelA.costPerActiveUserPerMonth >
              modelB.costPerActiveUserPerMonth
            ? "b"
            : null,
    },
  ];

  return (
    <section
      aria-labelledby="comparison-heading"
      className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="comparison-heading"
            className="text-base font-semibold text-blue-950 dark:text-blue-100"
          >
            {copy.heading}
          </h2>
          <p className="mt-1 text-sm text-blue-900/80 dark:text-blue-200/80">
            {copy.description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:text-blue-950 dark:hover:bg-blue-400"
        >
          {copy.clear}
        </button>
      </div>

      {/* Model Headers */}
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-white/70 p-3 dark:bg-black/20">
        <div className="text-xs uppercase text-blue-900/70 dark:text-blue-200/70">
          {copy.metric}
        </div>
        <div className="text-center text-sm font-semibold text-blue-950 dark:text-blue-100">
          {modelA.model.displayName}
        </div>
        <div className="text-center text-sm font-semibold text-blue-950 dark:text-blue-100">
          {modelB.model.displayName}
        </div>
      </div>

      {/* Comparison Rows */}
      <div className="mt-2 space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-3 gap-2 rounded-lg bg-white/70 p-3 dark:bg-black/20"
          >
            <div className="text-sm text-blue-900/80 dark:text-blue-200/80">
              {row.label}
            </div>
            <div
              className={[
                "text-center text-sm tabular-nums font-medium",
                row.highlight === "a"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-900 dark:text-zinc-100",
              ].join(" ")}
            >
              {row.valueA}
            </div>
            <div
              className={[
                "text-center text-sm tabular-nums font-medium",
                row.highlight === "b"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-900 dark:text-zinc-100",
              ].join(" ")}
            >
              {row.valueB}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {costDiffAbs > 0.0001 && (
        <div className="mt-4 rounded-lg bg-white/70 p-3 dark:bg-black/20">
          <p className="text-sm text-blue-900/80 dark:text-blue-200/80">
            {copy.switchingTo}{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {cheaper.model.displayName}
            </span>{" "}
            {copy.saves}{" "}
            <span className="font-semibold">
              {formatCurrency(costDiffAbs, currency, exchangeRate)} ({formatPercent(costDiffPercent)})
            </span>
            {copy.perMonth && " "}
            {copy.perMonth}.
          </p>
        </div>
      )}
    </section>
  );
}
