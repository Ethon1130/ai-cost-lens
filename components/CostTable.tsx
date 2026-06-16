import { formatUsd } from "@/lib/calculate";
import type { CostReport } from "@/lib/calculate";

interface CostTableProps {
  report: CostReport;
}

export function CostTable({ report }: CostTableProps) {
  return (
    <section aria-labelledby="table-heading" className="space-y-3">
      <div>
        <h2
          id="table-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          4. Per-model monthly cost
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Scroll horizontally on small screens. Cheapest model is highlighted.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Model
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Provider
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Input
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Output
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Total / mo
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Per 1k req
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {report.models.map((b) => {
              const isCheapest = b.model.model === report.cheapestModelId;
              return (
                <tr
                  key={b.model.model}
                  className={[
                    isCheapest
                      ? "bg-emerald-50/60 dark:bg-emerald-900/20"
                      : "bg-white dark:bg-zinc-950",
                  ].join(" ")}
                >
                  <th
                    scope="row"
                    className="whitespace-nowrap px-4 py-3 text-left font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    <div className="flex items-center gap-2">
                      <span>{b.model.displayName}</span>
                      {isCheapest ? (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Cheapest
                        </span>
                      ) : null}
                    </div>
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {b.model.provider}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-800 dark:text-zinc-200">
                    {formatUsd(b.inputCost)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-800 dark:text-zinc-200">
                    {formatUsd(b.outputCost)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatUsd(b.totalCost)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                    {formatUsd(b.costPer1KRequests)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
