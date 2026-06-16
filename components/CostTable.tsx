import { useMemo, useState } from "react";
import { formatCurrency, pickCheapest } from "@/lib/calculate";
import type { CostReport } from "@/lib/calculate";
import type { Currency } from "@/lib/currency";
import type { AppCopy } from "@/lib/i18n";

type SortKey = "model" | "provider" | "input" | "output" | "total" | "perRequest" | "per1K" | "perUser";
type SortDir = "asc" | "desc";

function compareBreakdown(
  a: CostReport["models"][number],
  b: CostReport["models"][number],
  key: SortKey,
): number {
  switch (key) {
    case "model":
      return a.model.displayName.localeCompare(b.model.displayName);
    case "provider":
      return a.model.provider.localeCompare(b.model.provider);
    case "input":
      return a.inputCost - b.inputCost;
    case "output":
      return a.outputCost - b.outputCost;
    case "total":
      return a.totalCost - b.totalCost;
    case "perRequest":
      return a.costPerRequest - b.costPerRequest;
    case "per1K":
      return a.costPer1KRequests - b.costPer1KRequests;
    case "perUser":
      return a.costPerActiveUserPerMonth - b.costPerActiveUserPerMonth;
  }
}

// TODO(P0): CostTable 增加「成本构成」列拆分：
//   - 当 cacheHitRate > 0 时，拆出 freshInputCost / cachedInputCost / outputCost 三列
//   - 当 retryRate > 0 时，增加 retryCost 列
//   - 当启用 batch mode 时，增加 batchDiscount 列（显示折扣前/后金额）
// TODO(P1): 增加「计费方式」图标列，标注 Token / Runtime / Output 三种计费模型
//   （Replicate 部分模型按运行时计费，fal.ai 按输出计费）。

interface CostTableProps {
  report: CostReport;
  copy: AppCopy["table"];
  modelFilterCopy: AppCopy["modelFilter"];
  currency: Currency;
  exchangeRate: number;
  /** Currently selected model IDs for comparison (up to 2). */
  selectedModelIds: string[];
  /** Callback when user changes model selection. */
  onSelectedModelIdsChange: (ids: string[]) => void;
  /** Optional controlled provider filter (lifted to the parent). */
  selectedProviders?: string[];
  onSelectedProvidersChange?: (providers: string[]) => void;
  /** Optional controlled search query (lifted to the parent). */
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export function CostTable({
  report,
  copy,
  modelFilterCopy,
  currency,
  exchangeRate,
  selectedModelIds,
  onSelectedModelIdsChange,
  selectedProviders: controlledProviders,
  onSelectedProvidersChange,
  searchQuery: controlledSearch,
  onSearchQueryChange,
}: CostTableProps) {
  const isProvidersControlled = controlledProviders !== undefined;
  const isSearchControlled = controlledSearch !== undefined;
  const [internalProviders, setInternalProviders] = useState<string[]>([]);
  const [internalSearch, setInternalSearch] = useState("");

  const selectedProviders = isProvidersControlled ? controlledProviders! : internalProviders;
  const searchQuery = isSearchControlled ? controlledSearch! : internalSearch;

  const setSelectedProviders = (next: string[]) => {
    if (isProvidersControlled) {
      onSelectedProvidersChange?.(next);
    } else {
      setInternalProviders(next);
    }
  };
  const setSearchQuery = (next: string) => {
    if (isSearchControlled) {
      onSearchQueryChange?.(next);
    } else {
      setInternalSearch(next);
    }
  };

  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // Get all unique providers from report models
  const allProviders = useMemo(() => {
    const providerSet = new Set<string>();
    for (const m of report.models) {
      providerSet.add(m.model.provider);
    }
    const providerOrder = ["OpenAI", "Anthropic", "Google", "DeepSeek", "Mistral", "Meta", "xAI", "Qwen", "Amazon", "Moonshot", "Minimax"];
    const sortedProviders = [...providerSet].sort((a, b) => {
      const idxA = providerOrder.indexOf(a);
      const idxB = providerOrder.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
    return sortedProviders;
  }, [report.models]);

  // Filter models based on selected providers and search query
  const filteredModels = useMemo(() => {
    let filtered = report.models;

    // Filter by selected providers
    if (selectedProviders.length > 0) {
      filtered = filtered.filter((m) => selectedProviders.includes(m.model.provider));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.model.displayName.toLowerCase().includes(query) ||
          m.model.model.toLowerCase().includes(query) ||
          m.model.provider.toLowerCase().includes(query),
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => compareBreakdown(a, b, sortKey));
    if (sortDir === "desc") sorted.reverse();
    return sorted;
  }, [report.models, selectedProviders, searchQuery, sortKey, sortDir]);

  // Cheapest within the currently visible (filtered) set. When the table is
  // unfiltered this matches the global report.cheapestModelId, so behavior
  // stays identical for users who don't touch the filter.
  //
  // Compare by object reference (not by `model` string) so models sharing a
  // missing / duplicate `id` can't all light up at once.
  const visibleCheapest = useMemo(
    () => pickCheapest(filteredModels),
    [filteredModels],
  );

  return (
    <section aria-labelledby="table-heading" className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="table-heading"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {copy.heading}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {copy.description}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Filter Dropdown */}
          <div className="relative">
            <select
              id="provider-filter-table"
              value={selectedProviders.length === 0 ? "all" : selectedProviders.join(",")}
              onChange={(e) => {
                if (e.target.value === "all") {
                  setSelectedProviders([]);
                } else {
                  setSelectedProviders([e.target.value]);
                }
              }}
              className={[
                "appearance-none rounded-lg border border-zinc-300 bg-white px-3 py-1.5 pr-8 text-xs",
                "text-zinc-700 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900",
                "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300",
                "dark:focus:border-zinc-300 dark:focus:ring-zinc-300",
              ].join(" ")}
            >
              <option value="all">{modelFilterCopy.allProviders}</option>
              {allProviders.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3 text-zinc-500" />
          </div>

          {/* Search Box */}
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={modelFilterCopy.searchPlaceholder}
              className={[
                "w-36 rounded-lg border border-zinc-300 bg-white py-1.5 pl-8 pr-3 text-xs",
                "text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900",
                "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:placeholder:text-zinc-500",
                "dark:focus:border-zinc-300 dark:focus:ring-zinc-300",
              ].join(" ")}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </div>

          {/* Model Count */}
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {filteredModels.length} {modelFilterCopy.models}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
            <tr>
              <th scope="col" className="px-4 py-3 w-10 font-medium">
                <span title={copy.selectForComparison}>{copy.select}</span>
              </th>
              <SortableTh
                label={copy.model}
                sortKey="model"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                align="left"
              />
              <SortableTh
                label={copy.provider}
                sortKey="provider"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                align="left"
              />
              <SortableTh
                label={copy.input}
                sortKey="input"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                align="right"
              />
              <SortableTh
                label={copy.output}
                sortKey="output"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                align="right"
              />
              <SortableTh
                label={copy.totalPerMonth}
                sortKey="total"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                align="right"
              />
              <SortableTh
                label={copy.perRequest}
                sortKey="perRequest"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                align="right"
              />
              <SortableTh
                label={copy.per1KRequests}
                sortKey="per1K"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                align="right"
              />
              <SortableTh
                label={copy.perUserPerMonth}
                sortKey="perUser"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredModels.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {modelFilterCopy.emptyResults}
                </td>
              </tr>
            ) : (
              filteredModels.map((b) => {
                const isCheapest = b === visibleCheapest;
                const isSelected = selectedModelIds.includes(b.model.model);
                const canSelect = isSelected || selectedModelIds.length < 2;

                return (
                  <tr
                    key={b.model.model}
                    className={[
                      isCheapest
                        ? "bg-emerald-50/60 dark:bg-emerald-900/20"
                        : "bg-white dark:bg-zinc-950",
                      isSelected
                        ? "ring-2 ring-blue-500 ring-inset dark:ring-blue-400"
                        : "",
                    ].join(" ")}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!canSelect && !isSelected}
                        onChange={() => {
                          if (isSelected) {
                            onSelectedModelIdsChange(
                              selectedModelIds.filter((id) => id !== b.model.model),
                            );
                          } else if (canSelect) {
                            onSelectedModelIdsChange([...selectedModelIds, b.model.model]);
                          }
                        }}
                        className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-blue-400 dark:focus:ring-blue-400 cursor-pointer"
                        title={copy.selectForComparison}
                      />
                    </td>
                    <th
                      scope="row"
                      className="whitespace-nowrap px-4 py-3 text-left font-medium text-zinc-900 dark:text-zinc-100"
                    >
                      <div className="flex items-center gap-2">
                        <span>{b.model.displayName}</span>
                        {isCheapest ? (
                          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            {copy.cheapest}
                          </span>
                        ) : null}
                      </div>
                    </th>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {b.model.provider}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-800 dark:text-zinc-200">
                      {formatCurrency(b.inputCost, currency, exchangeRate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-800 dark:text-zinc-200">
                      {formatCurrency(b.outputCost, currency, exchangeRate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(b.totalCost, currency, exchangeRate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                      {formatCurrency(b.costPerRequest, currency, exchangeRate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                      {formatCurrency(b.costPer1KRequests, currency, exchangeRate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                      {formatCurrency(b.costPerActiveUserPerMonth, currency, exchangeRate)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SortIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 15 6-6 6 6" />
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SortableTh({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDir;
  onSort: (key: SortKey) => void;
  align: "left" | "right";
}) {
  const isActive = activeKey === sortKey;
  return (
    <th
      scope="col"
      className={[
        "px-4 py-3 font-medium",
        align === "right" ? "text-right" : "text-left",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-sort={
          isActive ? (direction === "asc" ? "ascending" : "descending") : "none"
        }
        className={[
          "inline-flex items-center gap-1 select-none cursor-pointer",
          "uppercase tracking-wide",
          isActive
            ? "text-zinc-900 dark:text-zinc-100"
            : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200",
        ].join(" ")}
      >
        <span>{label}</span>
        <SortIcon
          className={[
            "size-3 transition-opacity",
            isActive ? "opacity-100" : "opacity-40",
          ].join(" ")}
        />
      </button>
    </th>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
