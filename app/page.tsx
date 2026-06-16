"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CostSummary } from "@/components/CostSummary";
import { CostTable } from "@/components/CostTable";
import { KnownLimitations } from "@/components/KnownLimitations";
import { PricingSources } from "@/components/PricingSources";
import { SavingsComparison } from "@/components/SavingsComparison";
import { ScenarioParams } from "@/components/ScenarioParams";
import { ScenarioPresets } from "@/components/ScenarioPresets";
import { UsageForm } from "@/components/UsageForm";
import { computeCostReport } from "@/lib/calculate";
import type { UsageInput } from "@/lib/calculate";
import { COPY } from "@/lib/i18n";
import type { Language, ThemeMode } from "@/lib/i18n";
import { MODELS } from "@/lib/pricing";
import { deriveScenarioTokens } from "@/lib/scenarioTokens";
import { getScenarioById, SCENARIOS } from "@/lib/scenarios";
import type { ScenarioParams as ScenarioParamsType } from "@/lib/scenarios";

export default function Home() {
  const defaultScenario = SCENARIOS[0];
  const [activeScenarioId, setActiveScenarioId] = useState(defaultScenario.id);
  const [scenarioParams, setScenarioParams] = useState<ScenarioParamsType>(
    defaultScenario.params,
  );
  const [usage, setUsage] = useState<UsageInput>(defaultScenario.usage);
  const [language, setLanguage] = useState<Language>("en");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const copy = COPY[language];

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
  }, [themeMode]);

  const handleSelectScenario = (id: string) => {
    const next = getScenarioById(id);
    if (!next) return;
    setActiveScenarioId(next.id);
    setScenarioParams(next.params);
    setUsage(next.usage);
  };

  const tokenEstimate = useMemo(
    () => deriveScenarioTokens(scenarioParams),
    [scenarioParams],
  );
  const computedUsage = useMemo<UsageInput>(
    () => ({
      ...usage,
      avgInputTokens: tokenEstimate.avgInputTokens,
      avgOutputTokens: tokenEstimate.avgOutputTokens,
    }),
    [usage, tokenEstimate],
  );
  const report = useMemo(
    () => computeCostReport(computedUsage, MODELS),
    [computedUsage],
  );

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
        <header className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {copy.hero.badge}
              </span>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {copy.hero.title}
              </h1>
              <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
                {copy.hero.description}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <IconToggle
                label={
                  language === "en"
                    ? copy.controls.chinese
                    : copy.controls.english
                }
                onClick={() => setLanguage(language === "en" ? "zh" : "en")}
              >
                <LanguageIcon />
              </IconToggle>
              <IconToggle
                label={
                  themeMode === "light"
                    ? copy.controls.dark
                    : copy.controls.light
                }
                onClick={() =>
                  setThemeMode(themeMode === "light" ? "dark" : "light")
                }
              >
                {themeMode === "light" ? <MoonIcon /> : <SunIcon />}
              </IconToggle>
            </div>
          </div>
        </header>

        <ScenarioPresets
          activeId={activeScenarioId}
          copy={copy.scenarios}
          onSelect={handleSelectScenario}
        />
        <ScenarioParams
          params={scenarioParams}
          tokenEstimate={tokenEstimate}
          copy={copy.scenarioParams}
          onChange={setScenarioParams}
        />
        <UsageForm usage={usage} copy={copy.usage} onChange={setUsage} />
        <CostSummary report={report} copy={copy.summary} />
        <SavingsComparison report={report} copy={copy.savings} />
        <CostTable report={report} copy={copy.table} />
        <PricingSources copy={copy.sources} />
        <KnownLimitations copy={copy.limitations} />

        <footer className="pt-2 text-xs text-zinc-500 dark:text-zinc-500">
          {copy.hero.footer}
        </footer>
      </main>
    </div>
  );
}

function IconToggle({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={[
        "inline-flex size-10 items-center justify-center rounded-lg border transition-colors",
        "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950",
        "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2",
        "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100 dark:focus:ring-zinc-100 dark:focus:ring-offset-black",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function LanguageIcon() {
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
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

function MoonIcon() {
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
      <path d="M12 3a6 6 0 0 0 9 7.5A9 9 0 1 1 12 3Z" />
    </svg>
  );
}

function SunIcon() {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}
