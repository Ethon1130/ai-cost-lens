"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { AppCopy } from "@/lib/i18n";

/**
 * One-tap "Copy share link" button.
 *
 * - Reads window.location.href (the URL the bridge has been keeping in sync).
 * - Prefers navigator.clipboard.writeText, falls back to a hidden <textarea>
 *   + document.execCommand("copy") for non-secure contexts.
 * - Shows a transient "copied" / "failed" tooltip anchored to the button.
 */
export function ShareLinkButton({
  copy,
  disabled,
}: {
  copy: AppCopy["share"];
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  async function handleClick() {
    const href =
      typeof window !== "undefined" ? window.location.href : "";
    if (!href) {
      setStatus("error");
      scheduleReset();
      return;
    }

    let ok = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(href);
        ok = true;
      } else {
        ok = legacyCopy(href);
      }
    } catch {
      ok = legacyCopy(href);
    }

    setStatus(ok ? "copied" : "error");
    scheduleReset();
  }

  function scheduleReset() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), 2000);
  }

  const tooltip = status === "copied" ? copy.copied : status === "error" ? copy.copyFailed : copy.buttonLabel;

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={copy.buttonLabel}
        title={copy.buttonLabel}
        aria-live="polite"
        onClick={handleClick}
        disabled={disabled}
        className={[
          "inline-flex size-10 items-center justify-center rounded-lg border transition-colors",
          "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950",
          "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2",
          "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100 dark:focus:ring-zinc-100 dark:focus:ring-offset-black",
          "disabled:cursor-not-allowed disabled:opacity-60",
        ].join(" ")}
      >
        <ShareIcon />
      </button>
      <div
        role="tooltip"
        className={[
          "pointer-events-none absolute right-0 top-full z-20 mt-2 w-max max-w-[16rem]",
          "rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs shadow-md",
          "transition duration-150",
          status === "idle"
            ? "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
            : "opacity-100 translate-y-0",
          "border-zinc-200 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200",
          status === "error" ? "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300" : "",
        ].join(" ")}
      >
        {tooltip}
      </div>
    </div>
  );
}

function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function ShareIcon(): ReactNode {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}
