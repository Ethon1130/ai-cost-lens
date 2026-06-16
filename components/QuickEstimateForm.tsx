"use client";

import { useMemo, useState } from "react";
import type { AppCopy } from "@/lib/i18n";
import { formatCurrency } from "@/lib/calculate";
import { toSafeNumber } from "@/lib/safeNumber";
import { QUICK_SCENARIOS } from "@/lib/scenarios";
import type { QuickScenario } from "@/lib/scenarios";
import type { ModelCostBreakdown } from "@/lib/pricing";
import type { Currency } from "@/lib/currency";

interface QuickEstimateFormProps {
  copy: AppCopy["quickEstimate"];
  selectedScenarioId: string;
  dailyUsers: number;
  requestsPerUserPerDay: number;
  inputIndex: number;
  outputIndex: number;
  onScenarioChange: (id: string) => void;
  onDailyUsersChange: (v: number) => void;
  onRequestsPerUserChange: (v: number) => void;
  onInputIndexChange: (i: number) => void;
  onOutputIndexChange: (i: number) => void;
}

export function QuickEstimateForm({
  copy,
  selectedScenarioId,
  dailyUsers,
  requestsPerUserPerDay,
  inputIndex,
  outputIndex,
  onScenarioChange,
  onDailyUsersChange,
  onRequestsPerUserChange,
  onInputIndexChange,
  onOutputIndexChange,
}: QuickEstimateFormProps) {
  const scenario = QUICK_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? QUICK_SCENARIOS[0];

  return (
    <section aria-labelledby="quick-heading" className="space-y-4">
      <div>
        <h2
          id="quick-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {copy.heading}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {copy.description}
        </p>
      </div>

      <div className="space-y-4">
        {/* Scenario selector */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="quick-scenario"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            {copy.scenarioLabel}
          </label>
          <select
            id="quick-scenario"
            value={selectedScenarioId}
            onChange={(e) => {
              onScenarioChange(e.target.value);
              const newScenario = QUICK_SCENARIOS.find((s) => s.id === e.target.value);
              if (newScenario) {
                onInputIndexChange(newScenario.defaultInputIndex);
                onOutputIndexChange(newScenario.defaultOutputIndex);
              }
            }}
            className={[
              "w-full rounded-lg border px-3 py-2 text-sm",
              "border-zinc-300 bg-white text-zinc-900",
              "focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900",
              "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100",
              "dark:focus:border-zinc-300 dark:focus:ring-zinc-300",
            ].join(" ")}
          >
            {QUICK_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            {scenario.description}
          </p>
        </div>

        {/* Traffic inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="quick-daily-users"
              className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              {copy.dailyUsersLabel}
            </label>
            <input
              id="quick-daily-users"
              type="number"
              inputMode="numeric"
              min={0}
              value={dailyUsers || ""}
              onChange={(e) =>
                onDailyUsersChange(toSafeNumber(e.target.value, 0, { min: 0, integer: true }))
              }
              placeholder="1000"
              className={[
                "w-full rounded-lg border px-3 py-2 text-sm tabular-nums",
                "border-zinc-300 bg-white text-zinc-900",
                "focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900",
                "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100",
                "dark:focus:border-zinc-300 dark:focus:ring-zinc-300",
              ].join(" ")}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-500">{copy.dailyUsersHint}</p>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="quick-requests-per-user"
              className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              {copy.requestsPerUserLabel}
            </label>
            <input
              id="quick-requests-per-user"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={requestsPerUserPerDay || ""}
              onChange={(e) =>
                onRequestsPerUserChange(toSafeNumber(e.target.value, 0, { min: 0 }))
              }
              placeholder="5"
              className={[
                "w-full rounded-lg border px-3 py-2 text-sm tabular-nums",
                "border-zinc-300 bg-white text-zinc-900",
                "focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900",
                "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100",
                "dark:focus:border-zinc-300 dark:focus:ring-zinc-300",
              ].join(" ")}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-500">{copy.requestsPerUserHint}</p>
          </div>
        </div>

        {/* Length options */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LengthOptionSelector
            label={copy.inputComplexityLabel}
            options={scenario.inputLengthOptions}
            selectedIndex={inputIndex}
            onChange={onInputIndexChange}
          />
          <LengthOptionSelector
            label={copy.outputLengthLabel}
            options={scenario.outputLengthOptions}
            selectedIndex={outputIndex}
            onChange={onOutputIndexChange}
          />
        </div>
      </div>
    </section>
  );
}

interface LengthOptionSelectorProps {
  label: string;
  options: QuickScenario["inputLengthOptions"] | QuickScenario["outputLengthOptions"];
  selectedIndex: number;
  onChange: (index: number) => void;
}

function LengthOptionSelector({
  label,
  options,
  selectedIndex,
  onChange,
}: LengthOptionSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={selectedIndex === i}
            onClick={() => onChange(i)}
            className={[
              "rounded-full px-3 py-1.5 text-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2",
              "dark:focus:ring-zinc-100 dark:focus:ring-offset-black",
              selectedIndex === i
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                : "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-500",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

interface QuickResultsProps {
  copy: AppCopy["quickEstimate"];
  modelFilterCopy: AppCopy["modelFilter"];
  breakdowns: ModelCostBreakdown[];
  cheapestId: string | null;
  currency: Currency;
  exchangeRate: number;
  monthlyRequests: number;
}

export function QuickResults({
  copy,
  modelFilterCopy,
  breakdowns,
  cheapestId,
  currency,
  exchangeRate,
  monthlyRequests,
}: QuickResultsProps) {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const hasTraffic = monthlyRequests > 0 && breakdowns.some((b) => b.totalCost > 0);

  // Get all unique providers from breakdowns
  const allProviders = useMemo(() => {
    const providerSet = new Set<string>();
    for (const bd of breakdowns) {
      providerSet.add(bd.model.provider);
    }
    const providerOrder = ["OpenAI", "Anthropic", "Google", "DeepSeek", "Mistral", "Meta", "xAI", "Qwen", "Amazon", "Moonshot"];
    const sortedProviders = [...providerSet].sort((a, b) => {
      const idxA = providerOrder.indexOf(a);
      const idxB = providerOrder.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
    return sortedProviders;
  }, [breakdowns]);

  // Filter breakdowns based on selected providers and search query
  const filteredBreakdowns = useMemo(() => {
    let filtered = breakdowns;

    // Filter by selected providers
    if (selectedProviders.length > 0) {
      filtered = filtered.filter((bd) => selectedProviders.includes(bd.model.provider));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (bd) =>
          bd.model.displayName.toLowerCase().includes(query) ||
          bd.model.model.toLowerCase().includes(query) ||
          bd.model.provider.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [breakdowns, selectedProviders, searchQuery]);

  const toggleProvider = (provider: string) => {
    setSelectedProviders((prev) =>
      prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider],
    );
  };

  const selectAllProviders = () => {
    setSelectedProviders([]);
  };

  const clearProviders = () => {
    setSelectedProviders([]);
  };

  if (!hasTraffic) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        {copy.noTraffic}
      </div>
    );
  }

  const sortedBreakdowns = [...filteredBreakdowns].sort((a, b) => a.totalCost - b.totalCost);
  const cheapest = filteredBreakdowns.find((b) => b.model.model === cheapestId);

  // Group by provider (simple object, no need for useMemo)
  const groupedByProvider: Record<string, ModelCostBreakdown[]> = {};
  for (const bd of sortedBreakdowns) {
    const provider = bd.model.provider || "Other";
    if (!groupedByProvider[provider]) groupedByProvider[provider] = [];
    groupedByProvider[provider]!.push(bd);
  }

  const providerOrder = ["OpenAI", "Anthropic", "Google", "DeepSeek", "Mistral", "Meta", "xAI", "Qwen", "Amazon", "Moonshot"];
  const providers = Object.keys(groupedByProvider).sort((a, b) => {
    const idxA = providerOrder.indexOf(a);
    const idxB = providerOrder.indexOf(b);
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {copy.resultHeading}
        </h3>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Provider Filter Dropdown */}
          <div className="relative">
            <select
              id="provider-filter"
              value={selectedProviders.length === 0 ? "all" : selectedProviders.join(",")}
              onChange={(e) => {
                if (e.target.value === "all") {
                  setSelectedProviders([]);
                } else if (e.target.value === "none") {
                  setSelectedProviders([]);
                } else {
                  // Single provider selected
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
            {filteredBreakdowns.length} {modelFilterCopy.models}
          </span>
        </div>
      </div>

      {providers.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          No models match your filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => {
            const models = groupedByProvider[provider];
            const bestInGroup = models.reduce((best, current) =>
              current.totalCost < best.totalCost ? current : best,
            );

            return (
              <div key={provider} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {provider}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {copy.cheapestModel}: <span className="font-medium">{bestInGroup.model.displayName}</span>
                </span>
              </div>
              <div className="space-y-1.5">
                {models.map((bd) => {
                  const isCheapest = bd.model.model === cheapestId;
                  return (
                    <div
                      key={bd.model.model}
                      className={[
                        "flex items-center justify-between rounded px-2 py-1.5",
                        isCheapest
                          ? "bg-emerald-50 dark:bg-emerald-950/50"
                          : "",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={[
                          "text-sm",
                          isCheapest ? "font-medium text-emerald-700 dark:text-emerald-300" : "text-zinc-700 dark:text-zinc-300",
                        ].join(" ")}>
                          {bd.model.displayName}
                        </span>
                        {isCheapest && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                            Best
                          </span>
                        )}
                      </div>
                      <span className={[
                        "text-sm tabular-nums",
                        isCheapest ? "font-semibold text-emerald-700 dark:text-emerald-300" : "text-zinc-600 dark:text-zinc-400",
                      ].join(" ")}>
                        {formatCurrency(bd.totalCost, currency, exchangeRate)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
          })}
        </div>
      )}

      {cheapest && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-medium">{copy.recommendation}: </span>
            {cheapest.model.displayName} {copy.cheapestModel.toLowerCase()}
          </p>
        </div>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-500">
        {copy.monthlyRequests}: {monthlyRequests.toLocaleString()}
      </p>
    </div>
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
