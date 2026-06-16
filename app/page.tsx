"use client";

import { useMemo, useState } from "react";
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
        <header className="space-y-3">
          <span className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            AI Cost Lens
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            AI API cost simulator for early-stage products.
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            Pick a product scenario, tune the token assumptions behind it, and
            compare monthly cost across official OpenAI, Anthropic, and Google
            pricing snapshots. No account, no API key, no external calls.
          </p>
        </header>

        <ScenarioPresets
          activeId={activeScenarioId}
          onSelect={handleSelectScenario}
        />
        <ScenarioParams
          params={scenarioParams}
          tokenEstimate={tokenEstimate}
          onChange={setScenarioParams}
        />
        <UsageForm usage={usage} onChange={setUsage} />
        <CostSummary report={report} />
        <SavingsComparison report={report} />
        <CostTable report={report} />
        <PricingSources />
        <KnownLimitations />

        <footer className="pt-2 text-xs text-zinc-500 dark:text-zinc-500">
          Built for indie devs evaluating an AI project. Data is a manual
          snapshot; verify the latest price on the linked official page before
          making a decision.
        </footer>
      </main>
    </div>
  );
}
