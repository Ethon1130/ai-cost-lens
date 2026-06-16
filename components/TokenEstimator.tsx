"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { encodingForModel, getEncoding } from "js-tiktoken";
import { toSafeNumber } from "@/lib/safeNumber";

const MAX_TEXT_CHARS = 20_000;

interface InlineTokenEstimatorProps {
  /** i18n copy for the popover */
  copy: {
    placeholder: string;
    tokenizerLabel: string;
    tokensLabel: string;
    approximateNotice: string;
    applyButton: string;
    cancelButton: string;
    hint: string;
  };
  /** Which field this estimator targets (used in the hint) */
  fieldLabel: string;
  /** Called when user clicks Apply with the estimated token count */
  onApply: (tokens: number) => void;
  /** The parent field's current numeric value (to show as reference) */
  currentValue: number;
}

interface TokenEstimate {
  tokens: number;
  approximate: boolean;
}

export function InlineTokenEstimator({
  copy,
  fieldLabel,
  onApply,
  currentValue,
}: InlineTokenEstimatorProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const estimate = useMemo(() => estimateGptTokens(text), [text]);
  const safeTokens = toSafeNumber(estimate.tokens, 0, {
    min: 0,
    max: 10_000_000,
    integer: true,
  });

  // Close popover when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Reset text when popover opens
  useEffect(() => {
    if (open) setText("");
  }, [open]);

  function handleApply() {
    const final = toSafeNumber(safeTokens, 0, { min: 0, integer: true });
    onApply(final);
    setOpen(false);
    setText("");
  }

  function handleCancel() {
    setOpen(false);
    setText("");
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Estimate tokens for ${fieldLabel}`}
        title={`${copy.applyButton} "${fieldLabel}"`}
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex size-7 items-center justify-center rounded-md border transition-colors",
          "border-zinc-300 bg-white text-zinc-500 hover:border-zinc-500 hover:text-zinc-900",
          "focus:outline-none focus:ring-1 focus:ring-zinc-900",
          "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100 dark:focus:ring-zinc-100",
        ].join(" ")}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <rect x="2" y="3" width="12" height="10" rx="1.5" />
          <path d="M5 6h6M5 9h4" />
        </svg>
      </button>

      {open && (
        <div
          ref={popoverRef}
          className={[
            "absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border shadow-lg",
            "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950",
          ].join(" ")}
        >
          <div className="flex flex-col gap-3 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {copy.tokenizerLabel}
              </p>
              <p className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                GPT-4 tokenizer
              </p>
            </div>

            {/* Textarea */}
            <textarea
              autoFocus
              value={text}
              maxLength={MAX_TEXT_CHARS}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_CHARS))}
              placeholder={copy.placeholder}
              className={[
                "min-h-20 w-full resize-y rounded-lg border px-3 py-2 text-sm leading-5",
                "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400",
                "focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900",
                "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600",
                "dark:focus:border-zinc-300 dark:focus:ring-zinc-300",
              ].join(" ")}
            />

            {/* Token count + approximate warning */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {safeTokens.toLocaleString("en-US")}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {copy.tokensLabel}
                </span>
              </div>

              {estimate.approximate && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:border-amber-800/70 dark:bg-amber-950/30 dark:text-amber-300">
                  {copy.approximateNotice}
                </p>
              )}
            </div>

            {/* Character count */}
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {text.length.toLocaleString("en-US")} / {MAX_TEXT_CHARS.toLocaleString("en-US")} chars
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleApply}
                disabled={safeTokens === 0}
                className={[
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-40",
                  "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1",
                  "dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus:ring-zinc-100",
                ].join(" ")}
              >
                {copy.applyButton}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={[
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  "border-zinc-300 text-zinc-600 hover:bg-zinc-50",
                  "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1",
                  "dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:focus:ring-zinc-100",
                ].join(" ")}
              >
                {copy.cancelButton}
              </button>
            </div>

            {/* Hint */}
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {copy.hint.replace("{field}", fieldLabel).replace("{current}", currentValue.toLocaleString("en-US"))}
            </p>
          </div>
        </div>
      )}
    </div>
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
