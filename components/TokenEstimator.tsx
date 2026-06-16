"use client";

import { useMemo, useState } from "react";
import { encodingForModel, getEncoding } from "js-tiktoken";
import type { AppCopy } from "@/lib/i18n";
import type { ScenarioKind } from "@/lib/scenarios";
import { toSafeNumber } from "@/lib/safeNumber";

const MAX_TEXT_CHARS = 20_000;

interface TokenEstimatorProps {
  copy: AppCopy["tokenEstimator"];
  scenarioKind: ScenarioKind;
  onApply: (tokens: number) => void;
}

interface TokenEstimate {
  tokens: number;
  approximate: boolean;
}

export function TokenEstimator({
  copy,
  scenarioKind,
  onApply,
}: TokenEstimatorProps) {
  const [text, setText] = useState("");
  const estimate = useMemo(() => estimateGptTokens(text), [text]);
  const safeTokens = toSafeNumber(estimate.tokens, 0, {
    min: 0,
    max: 10_000_000,
    integer: true,
  });
  const targetLabel = copy.targets[scenarioKind];
  const isLimited = text.length >= MAX_TEXT_CHARS;

  return (
    <section aria-labelledby="token-estimator-heading" className="space-y-3">
      <div>
        <h2
          id="token-estimator-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {copy.heading}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {copy.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="token-estimator-text"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            {copy.textareaLabel}
          </label>
          <textarea
            id="token-estimator-text"
            value={text}
            maxLength={MAX_TEXT_CHARS}
            onChange={(event) =>
              setText(event.target.value.slice(0, MAX_TEXT_CHARS))
            }
            placeholder={copy.placeholder}
            className={[
              "min-h-36 w-full resize-y rounded-lg border px-3 py-2 text-sm leading-6",
              "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400",
              "focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900",
              "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600",
              "dark:focus:border-zinc-300 dark:focus:ring-zinc-300",
            ].join(" ")}
          />
          <div className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {text.length.toLocaleString("en-US")} /{" "}
              {MAX_TEXT_CHARS.toLocaleString("en-US")} {copy.characters}
            </span>
            {isLimited ? (
              <span className="font-medium text-amber-700 dark:text-amber-400">
                {copy.limitNotice}
              </span>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs uppercase text-zinc-500 dark:text-zinc-400">
            {copy.tokenizerLabel}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {safeTokens.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            {copy.tokensLabel}
          </p>

          {estimate.approximate ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-800 dark:border-amber-800/70 dark:bg-amber-950/30 dark:text-amber-300">
              {copy.approximateNotice}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => onApply(safeTokens)}
            className={[
              "mt-4 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "bg-zinc-900 text-white hover:bg-zinc-700",
              "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2",
              "dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus:ring-zinc-100 dark:focus:ring-offset-black",
            ].join(" ")}
          >
            {copy.applyButton}
          </button>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            {copy.applyHint.replace("{target}", targetLabel)}
          </p>
        </div>
      </div>
    </section>
  );
}

function estimateGptTokens(text: string): TokenEstimate {
  if (!text) {
    return { tokens: 0, approximate: false };
  }

  try {
    return {
      tokens: encodingForModel("gpt-4").encode(text).length,
      approximate: false,
    };
  } catch {
    try {
      return {
        tokens: getEncoding("cl100k_base").encode(text).length,
        approximate: false,
      };
    } catch {
      return {
        tokens: Math.ceil(text.length / 4),
        approximate: true,
      };
    }
  }
}
