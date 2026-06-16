"use client";

import { useMemo, useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/calculate";
import type { UsageInput } from "@/lib/calculate";
import type { Currency } from "@/lib/currency";
import type { ModelPrice } from "@/lib/pricing";
import type { AppCopy } from "@/lib/i18n";
import { generateCombos } from "@/lib/combo";
import type { ComboId, ModelCombo as ModelComboData } from "@/lib/combo";

interface ModelComboProps {
  usage: UsageInput;
  models: ModelPrice[];
  copy: AppCopy["combo"];
  currency: Currency;
  exchangeRate: number;
  /** Current scenario id, used to surface batch-friendliness hints. */
  scenarioId?: string | null;
}

const SCHEME_THEMES: Record<
  ComboId,
  { border: string; bg: string; heading: string; chip: string; accent: string }
> = {
  "all-high": {
    border: "border-emerald-200 dark:border-emerald-900/50",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    heading: "text-emerald-950 dark:text-emerald-100",
    chip:
      "border-emerald-300 text-emerald-900 dark:border-emerald-800 dark:text-emerald-200",
    accent: "text-emerald-700 dark:text-emerald-300",
  },
  router: {
    border: "border-sky-200 dark:border-sky-900/50",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    heading: "text-sky-950 dark:text-sky-100",
    chip:
      "border-sky-300 text-sky-900 dark:border-sky-800 dark:text-sky-200",
    accent: "text-sky-700 dark:text-sky-300",
  },
  batch: {
    border: "border-amber-200 dark:border-amber-900/50",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    heading: "text-amber-950 dark:text-amber-100",
    chip:
      "border-amber-300 text-amber-900 dark:border-amber-800 dark:text-amber-200",
    accent: "text-amber-700 dark:text-amber-300",
  },
};

export function ModelCombo({
  usage,
  models,
  copy,
  currency,
  exchangeRate,
  scenarioId,
}: ModelComboProps) {
  // ponytail: stable memo so the empty-array branch doesn't churn useMemo deps.
  const safeModels = useMemo(
    () => (Array.isArray(models) ? models : []),
    [models],
  );
  const hasEnough = safeModels.length >= 2;

  // Anchor defaults to the most expensive model (the "all-high" baseline).
  const defaultAnchorId = useMemo(() => {
    if (safeModels.length === 0) return null;
    let best = safeModels[0];
    let bestCost = -Infinity;
    for (const m of safeModels) {
      const cost = (m.inputPer1M ?? 0) * (usage.avgInputTokens ?? 0)
        + (m.outputPer1M ?? 0) * (usage.avgOutputTokens ?? 0);
      if (cost > bestCost) {
        best = m;
        bestCost = cost;
      }
    }
    return best?.model ?? null;
  }, [safeModels, usage.avgInputTokens, usage.avgOutputTokens]);

  const [anchorModelId, setAnchorModelId] = useState<string | null>(defaultAnchorId);
  const [cheapRatio, setCheapRatio] = useState<number>(0.8);

  // If the model list refreshes and the current anchor disappears, fall back
  // to the new default. The fallback is computed during render (not in an
  // effect) so we never trigger a cascading setState.
  const effectiveAnchorId = useMemo(() => {
    if (anchorModelId && safeModels.some((m) => m.model === anchorModelId)) {
      return anchorModelId;
    }
    return defaultAnchorId;
  }, [anchorModelId, defaultAnchorId, safeModels]);

  const combos = useMemo(
    () => generateCombos({
      usage,
      models: safeModels,
      anchorModelId: effectiveAnchorId,
      cheapRatio,
      scenarioId: scenarioId ?? null,
    }),
    [usage, safeModels, effectiveAnchorId, cheapRatio, scenarioId],
  );

  if (!hasEnough) {
    return (
      <section
        aria-labelledby="combo-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
      >
        <h2
          id="combo-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {copy.heading}
        </h2>
        <p className="mt-2">{copy.notEnoughModels}</p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="combo-heading"
      className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="space-y-1">
        <h2
          id="combo-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {copy.heading}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {copy.description}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-xs">
          <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
            {copy.anchorLabel}
          </span>
          <select
            value={effectiveAnchorId ?? ""}
            onChange={(e) => setAnchorModelId(e.target.value || null)}
            className={[
              "w-full rounded-md border bg-white px-2 py-1.5 text-sm",
              "border-zinc-300 text-zinc-900 focus:border-zinc-900 focus:outline-none",
              "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-300",
            ].join(" ")}
            aria-describedby="combo-anchor-hint"
          >
            {safeModels.map((m) => (
              <option key={m.model} value={m.model}>
                {m.displayName} ({m.provider})
              </option>
            ))}
          </select>
          <span
            id="combo-anchor-hint"
            className="mt-1 block text-[11px] text-zinc-500 dark:text-zinc-500"
          >
            {copy.anchorHint}
          </span>
        </label>

        <label className="block text-xs">
          <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
            {copy.routerRatioLabel}: {Math.round(cheapRatio * 100)}%
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round(cheapRatio * 100)}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) {
                setCheapRatio(Math.min(Math.max(next / 100, 0), 1));
              }
            }}
            className="w-full accent-sky-600"
            aria-describedby="combo-ratio-hint"
          />
          <span
            id="combo-ratio-hint"
            className="mt-1 block text-[11px] text-zinc-500 dark:text-zinc-500"
          >
            {copy.routerRatioHint}
          </span>
        </label>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {combos.map((combo) => (
          <SchemeCard
            key={combo.id}
            combo={combo}
            copy={copy}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        ))}
      </div>
    </section>
  );
}

function SchemeCard({
  combo,
  copy,
  currency,
  exchangeRate,
}: {
  combo: ModelComboData;
  copy: AppCopy["combo"];
  currency: Currency;
  exchangeRate: number;
}) {
  const theme = SCHEME_THEMES[combo.id];
  const schemeCopy =
    combo.id === "all-high"
      ? copy.schemeA
      : combo.id === "router"
        ? copy.schemeB
        : copy.schemeC;

  const batchAvailable = combo.id === "batch" && combo.availability === "available";
  const batchUnavailable = combo.id === "batch" && combo.availability !== "available";
  const batchStatusText = combo.availability === "unsupported"
    ? copy.schemeC.unsupported
    : combo.availability === "not-recommended"
      ? copy.schemeC.notRecommended
      : null;
  const caveats = combo.id === "batch"
    ? combo.availability === "unsupported"
      ? copy.schemeC.unsupportedCaveats
      : combo.availability === "not-recommended"
        ? copy.schemeC.notRecommendedCaveats
        : copy.schemeC.caveats
    : schemeCopy.caveats;

  const cheapPercent = combo.breakdown.cheapModelPercent;
  const highPercent = combo.breakdown.expensiveModelPercent;
  const batchPercent = combo.breakdown.batchModelPercent;

  const noSavings =
    combo.savingsVsAllExpensive.amount <= 0
    || combo.monthlyCost <= 0;

  return (
    <article
      className={[
        "flex flex-col gap-3 rounded-xl border p-4",
        theme.border,
        theme.bg,
        batchUnavailable ? "opacity-75" : "",
      ].join(" ")}
    >
      <div className="space-y-1">
        <h3 className={["text-sm font-semibold", theme.heading].join(" ")}>
          {schemeCopy.name}
        </h3>
        <p className={["text-xs", theme.accent].join(" ")}>
          {batchStatusText ?? schemeCopy.tagline}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {schemeCopy.tags.map((tag) => (
          <span
            key={tag}
            className={[
              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
              theme.chip,
            ].join(" ")}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="rounded-lg bg-white/70 p-3 dark:bg-black/20">
        <div className={["text-[11px] uppercase", theme.accent].join(" ")}>
          {copy.monthlyCost}
        </div>
        <div
          className={[
            "mt-1 break-words text-xl font-semibold tabular-nums",
            theme.heading,
          ].join(" ")}
        >
          {batchUnavailable
            ? copy.batchUnavailableCost
            : formatCurrency(combo.monthlyCost, currency, exchangeRate)}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
          {cheapPercent > 0 ? (
            <span>
              {cheapPercent}% {copy.cheapShare}
            </span>
          ) : null}
          {highPercent > 0 ? (
            <span>
              {highPercent}% {copy.highShare}
            </span>
          ) : null}
          {batchPercent > 0 ? (
            <span>
              {batchPercent}% {copy.batchShare}
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg bg-white/70 px-3 py-2 text-xs dark:bg-black/20">
        {batchUnavailable ? (
          <span className={["font-medium", theme.accent].join(" ")}>
            {copy.batchSavingsUnavailable}
          </span>
        ) : noSavings ? (
          <span className={["font-medium", theme.accent].join(" ")}>
            {copy.savingsNone}
          </span>
        ) : (
          <span className={["font-medium tabular-nums", theme.heading].join(" ")}>
            {copy.savings}{" "}
            {formatCurrency(combo.savingsVsAllExpensive.amount, currency, exchangeRate)}{" "}
            ({formatPercent(combo.savingsVsAllExpensive.percent)})
          </span>
        )}
      </div>

      {batchAvailable ? (
        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
          {copy.latencyNote.replace(
            "{note}",
            copy.batchLatencyValue,
          )}
        </p>
      ) : null}

      <div>
        <div
          className={[
            "text-[11px] font-semibold uppercase",
            theme.accent,
          ].join(" ")}
        >
          {copy.caveatsHeading}
        </div>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-zinc-700 dark:text-zinc-300">
          {caveats.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
