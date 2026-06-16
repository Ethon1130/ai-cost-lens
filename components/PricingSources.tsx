import { useState } from "react";
import type { Currency } from "@/lib/currency";
import type { AppCopy } from "@/lib/i18n";
import type { ModelPrice, Provider } from "@/lib/pricing";

interface PricingSourcesProps {
  copy: AppCopy["sources"];
  currency: Currency;
  exchangeRate: number;
  pricingSource: "api" | "fallback";
  pricingUpdatedAt: string;
  pricingHasCached: boolean;
  models?: ModelPrice[];
}

export function PricingSources({
  copy,
  currency,
  exchangeRate,
  pricingSource,
  pricingUpdatedAt,
  pricingHasCached,
  models = [],
}: PricingSourcesProps) {
  // Group models by provider
  const grouped = groupByProvider(models);
  const providers = Object.keys(grouped) as Provider[];
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      aria-labelledby="sources-heading"
      className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2
            id="sources-heading"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {copy.heading}
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {copy.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                pricingSource === "api"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  pricingSource === "api" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {pricingSource === "api" ? "Live" : "Local"}
            </span>
          </div>
          <ChevronIcon expanded={isExpanded} />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* Data source status banner */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-900/60">
            {pricingUpdatedAt && (
              <span className="text-zinc-600 dark:text-zinc-400">
                Updated: {pricingUpdatedAt}
              </span>
            )}

            {pricingHasCached && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                Includes cached input prices
              </span>
            )}

            {pricingSource === "api" && (
              <a
                href="https://github.com/simonw/llm-prices"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                simonw/llm-prices
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {providers.map((p) => (
              <div
                key={p}
                className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800"
              >
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {p}
                </h3>
                <ul className="mt-2 space-y-3">
                  {grouped[p]?.map((m) => (
                    <li key={m.model} className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {m.displayName}
                        </span>
                        {m.cachedInputPer1M !== undefined && (
                          <span
                            className="inline-flex items-center rounded bg-blue-100 px-1 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            title="Supports prompt caching"
                          >
                            cached
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500">
                        {copy.input}{" "}
                        {formatCurrencyShort(m.inputPer1M, currency, exchangeRate)}{" "}
                        / 1M - {copy.output}{" "}
                        {formatCurrencyShort(m.outputPer1M, currency, exchangeRate)} / 1M
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500">
                        {copy.checked}: {m.checkedDate}
                      </div>
                      {m.notes ? (
                        <div className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-500">
                          {m.notes}
                        </div>
                      ) : null}
                      <a
                        href={m.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-xs text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                      >
                        {m.sourceUrl}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {models.length === 0 && (
            <p className="py-4 text-center text-sm text-zinc-500">
              No pricing data available. Using local fallback.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={[
        "h-5 w-5 text-zinc-400 transition-transform duration-200",
        expanded ? "rotate-180" : "",
      ].join(" ")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function formatCurrencyShort(
  value: number,
  currency: Currency,
  rate: number,
): string {
  const converted = currency === "USD" ? value : value * rate;
  if (!Number.isFinite(converted) || converted === 0)
    return currency === "USD" ? "$0" : "￥0";
  if (converted < 1)
    return `${currency === "USD" ? "$" : "￥"}${converted.toFixed(3)}`;
  return `${currency === "USD" ? "$" : "￥"}${converted.toFixed(2)}`;
}

function groupByProvider(
  models: ModelPrice[],
): Partial<Record<Provider, ModelPrice[]>> {
  const grouped: Partial<Record<Provider, ModelPrice[]>> = {};

  for (const m of models) {
    if (!grouped[m.provider]) {
      grouped[m.provider] = [];
    }
    grouped[m.provider]!.push(m);
  }

  return grouped;
}
