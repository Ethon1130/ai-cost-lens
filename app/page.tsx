"use client";

/* ============================================================
 * AI Cost Lens —— 升级路线分级 TODO（Todo+ 标记语法）
 * 标记格式：// TODO(Px): 描述
 *   P0 = 当前两天的核心差异化（必做，影响提交定位）
 *   P1 = 产品感强化（强烈建议）
 *   P2 = 加分项（可选）
 * 落点规则：标记写在「最该被实现的位置」附近，方便后续按文件 diff 落实。
 * ============================================================ */

// TODO(P0): 升级 Hero 标题/描述，从"cost simulator" 改为
//   "AI Cost Lens: 帮助开发者在接入 AI API 前，快速估算项目上线后的月成本、预算上限和最优模型组合"
//   当前 page.tsx hero 区域、i18n.ts hero.title/description、layout.tsx metadata 都需更新。
// TODO(P0): 顶部加入「模式切换 Tabs」：快速估算 | 精准计算 | 预算计划 | 模型组合推荐
//   在 CalculationModeToggle 之上再加一层 PrimaryMode，决定整体计算框架。
// TODO(P0): 拆分流量输入：把 avgInputTokens 派生为「输入长度(short/medium/long) + 输出长度(short/medium/long) + 场景」组合，
//   不再让普通开发者直接填 token 数字。新增 components/QuickEstimateForm.tsx。
// TODO(P0): 在 BudgetMode 输出里新增「预算反推 DAU / 每人每天请求量 / 月请求量」区块。
// TODO(P0): Currency 切换从局部存储提升为全局 toolbar 开关（已在 currency.ts / i18n 旁路；
//   需在 page.tsx 增加 useState(currency) 并把 formatUsd 替换为 formatCurrency(currency, fxRate)）。
// TODO(P0): 缓存命中率模拟 —— 新增 lib/cache.ts（computeCostReport 接受 cacheHitRate 字段）、
//   components/CacheHitRateSlider.tsx，CostTable 拆出 fresh input / cached input / output 三列。
// TODO(P0): 成本构成拆解 —— 新增 components/CostBreakdown.tsx，列出：
//   input 成本 / output 成本 / cached input 成本 / 重试成本 / 汇率影响。
// TODO(P0): 成本优化建议 —— 新增 lib/recommendations.ts + components/OptimizationTips.tsx，
//   基于 output 占比、cache 可行性、retry 率、batch 适用性生成 3-5 条建议。
// TODO(P1): 批处理模式开关 —— 新增 lib/batch.ts（应用 Batch 折扣），
//   新增 components/BatchModeToggle.tsx，CostSummary 增加「实时 vs 批处理」对比行。
// TODO(P1): 失败重试率 —— UsageInput 增加 retryRate 字段，
//   lib/calculate.ts 把 retries 转成 ×(1+retryRate) 乘数；ScenarioParams 同步支持。
// TODO(P1): 模型组合推荐 —— 新增 components/ModelCombo.tsx + lib/combo.ts：
//   A. 全程高质量；B. 80% 便宜 + 20% 高质量；C. 批处理/便宜模型优先。
//   给出「预估月成本」「成本下降 %」「适合场景」。
// TODO(P1): 导出 Markdown / JSON 报告 —— 新增 lib/report.ts + components/ExportButtons.tsx。
// TODO(P1): 「多供应商计费方式差异」提示卡 —— 新增 components/BillingModeNotice.tsx，
//   标注 Token / Runtime / Output 三种计费模型，覆盖 Replicate / fal.ai 等。
// TODO(P2): 图片成本估算器 —— 新增 lib/imagePricing.ts + components/ImageCostEstimator.tsx，
//   只读宽高，不上传文件，公式必须标注 limitation。
// TODO(P2): 多模型组合（planner + final answer 不同模型）—— lib/comboMulti.ts。
// TODO(P2): Chart 可视化（cost breakdown 柱状图 / 模型对比条形图）。
// TODO(P2): Embedding / Rerank 成本估算（RAG 进阶）。
// TODO(P2): Automated pricing change detection（fetch 官方价格并和快照 diff）。

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BudgetMode } from "@/components/BudgetMode";
import { QuickEstimateForm, QuickResults } from "@/components/QuickEstimateForm";
import { CostSummary } from "@/components/CostSummary";
import { CostTable } from "@/components/CostTable";
import { KnownLimitations } from "@/components/KnownLimitations";
import { ModelComparison } from "@/components/ModelComparison";
import { PricingSources } from "@/components/PricingSources";
import { SavingsComparison } from "@/components/SavingsComparison";
import { ScenarioParams } from "@/components/ScenarioParams";
import { ScenarioPresets } from "@/components/ScenarioPresets";
import { UsageForm } from "@/components/UsageForm";
import { computeBudgetReport, computeCostReport, computeQuickMonthlyRequests, quickToStandardUsage } from "@/lib/calculate";
import type { UsageInput } from "@/lib/calculate";
import { FIXED_FALLBACK_RATE, loadExchangeRate } from "@/lib/currency";
import type { Currency, FxSource } from "@/lib/currency";
import { COPY } from "@/lib/i18n";
import type { AppCopy, Language, ThemeMode } from "@/lib/i18n";
import { MODELS } from "@/lib/pricing";
import type { ModelPrice } from "@/lib/pricing";
import { deriveScenarioTokens } from "@/lib/scenarioTokens";
import { QUICK_SCENARIOS, getQuickScenarioById, getQuickScenarioTokens, getScenarioById, SCENARIOS } from "@/lib/scenarios";
import type { ScenarioParams as ScenarioParamsType } from "@/lib/scenarios";

type CalculationMode = "traffic" | "budget";
type PrimaryMode = "quick" | "advanced";

export default function Home() {
  const defaultScenario = SCENARIOS[0];
  const [activeScenarioId, setActiveScenarioId] = useState(defaultScenario.id);
  const [scenarioParams, setScenarioParams] = useState<ScenarioParamsType>(
    defaultScenario.params,
  );
  const [usage, setUsage] = useState<UsageInput>(defaultScenario.usage);
  const [calculationMode, setCalculationMode] =
    useState<CalculationMode>("traffic");
  const [monthlyBudget, setMonthlyBudget] = useState(100);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [exchangeRate, setExchangeRate] = useState<number>(FIXED_FALLBACK_RATE);
  const [fxSource, setFxSource] = useState<FxSource>("fallback");

  // Primary mode: quick (new user-friendly) vs advanced (existing developer mode)
  const [primaryMode, setPrimaryMode] = useState<PrimaryMode>("quick");

  // Quick estimation state
  const defaultQuickScenario =
    QUICK_SCENARIOS.find((scenario) => scenario.id === "code-assistant") ?? QUICK_SCENARIOS[0];
  const [quickScenarioId, setQuickScenarioId] = useState(defaultQuickScenario.id);
  const [quickApiCallsPerDay, setQuickApiCallsPerDay] = useState(100);
  const [quickDaysPerMonth, setQuickDaysPerMonth] = useState(30);
  const [quickActiveUsers, setQuickActiveUsers] = useState(0);
  const [quickInputIndex, setQuickInputIndex] = useState(defaultQuickScenario.defaultInputIndex);
  const [quickOutputIndex, setQuickOutputIndex] = useState(defaultQuickScenario.defaultOutputIndex);

  // LLM Prices API state - loads from simonw/llm-prices with fallback to static MODELS
  const [models, setModels] = useState<ModelPrice[]>(MODELS);
  const [pricingSource, setPricingSource] = useState<"api" | "fallback">("fallback");
  const [pricingUpdatedAt, setPricingUpdatedAt] = useState<string>("");
  const [pricingHasCached, setPricingHasCached] = useState<boolean>(false);

  const copy = COPY[language];

  // Load live pricing data from simonw/llm-prices API
  useEffect(() => {
    let cancelled = false;

    async function loadPricing() {
      try {
        const { getLlmPricesData } = await import("@/lib/llmPricesApi");
        const result = await getLlmPricesData();
        if (!cancelled) {
          setModels(result.models);
          setPricingSource(result.source);
          setPricingUpdatedAt(result.updatedAt);
          setPricingHasCached(result.hasCachedPrices);
        }
      } catch {
        if (!cancelled) {
          // Keep using static MODELS as fallback
          setPricingSource("fallback");
          setPricingUpdatedAt("N/A");
        }
      }
    }

    loadPricing();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
  }, [themeMode]);

  // Load live FX rate once on mount; never blocks first paint.
  useEffect(() => {
    let cancelled = false;
    loadExchangeRate().then((result) => {
      if (cancelled) return;
      setExchangeRate(result.rate);
      setFxSource(result.source);
    });
    return () => { cancelled = true; };
  }, []);

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
    () => computeCostReport(computedUsage, models),
    [computedUsage, models],
  );
  const budgetReport = useMemo(
    () =>
      computeBudgetReport(
        {
          monthlyBudget,
          avgInputTokens: tokenEstimate.avgInputTokens,
          avgOutputTokens: tokenEstimate.avgOutputTokens,
        },
        models,
      ),
    [monthlyBudget, tokenEstimate, models],
  );

  const quickScenario = getQuickScenarioById(quickScenarioId) ?? QUICK_SCENARIOS[0];
  const quickTokens = getQuickScenarioTokens(quickScenario, quickInputIndex, quickOutputIndex);
  const quickMonthlyRequests = useMemo(
    () =>
      computeQuickMonthlyRequests({
        apiCallsPerDay: quickApiCallsPerDay,
        daysPerMonth: quickDaysPerMonth,
        activeUsers: quickActiveUsers,
        avgInputTokens: quickTokens.avgInputTokens,
        avgOutputTokens: quickTokens.avgOutputTokens,
      }),
    [
      quickApiCallsPerDay,
      quickDaysPerMonth,
      quickActiveUsers,
      quickTokens.avgInputTokens,
      quickTokens.avgOutputTokens,
    ],
  );

  const quickUsage = useMemo(
    () => quickToStandardUsage({
      apiCallsPerDay: quickApiCallsPerDay,
      daysPerMonth: quickDaysPerMonth,
      activeUsers: quickActiveUsers,
      avgInputTokens: quickTokens.avgInputTokens,
      avgOutputTokens: quickTokens.avgOutputTokens,
    }),
    [quickApiCallsPerDay, quickDaysPerMonth, quickActiveUsers, quickTokens],
  );
  const quickReport = useMemo(
    () => computeCostReport(quickUsage, models),
    [quickUsage, models],
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
              <CurrencyToggleButton
                fxSource={fxSource}
                label={currency === "USD" ? copy.controls.currencyCny : copy.controls.currencyUsd}
                rateLabel={
                  fxSource === "live"
                    ? copy.controls.rateLive.replace("{rate}", exchangeRate.toFixed(4))
                    : copy.controls.rateDemo
                }
                onClick={() => setCurrency(currency === "USD" ? "CNY" : "USD")}
              >
                {currency === "USD" ? <DollarIcon /> : <YuanIcon />}
              </CurrencyToggleButton>
            </div>
          </div>
        </header>

        {/* Primary Mode Toggle (Quick vs Advanced) */}
        <PrimaryModeToggle
          mode={primaryMode}
          copy={copy.primaryMode}
          onChange={setPrimaryMode}
        />

        {/* Quick Estimate Mode */}
        {primaryMode === "quick" && (
          <div className="space-y-6">
            <QuickEstimateForm
              copy={copy.quickEstimate}
              scenarioCopy={copy.quickScenarios}
              selectedScenarioId={quickScenarioId}
              apiCallsPerDay={quickApiCallsPerDay}
              daysPerMonth={quickDaysPerMonth}
              activeUsers={quickActiveUsers}
              inputIndex={quickInputIndex}
              outputIndex={quickOutputIndex}
              onScenarioChange={(id) => {
                setQuickScenarioId(id);
                const s = getQuickScenarioById(id);
                if (s) {
                  setQuickInputIndex(s.defaultInputIndex);
                  setQuickOutputIndex(s.defaultOutputIndex);
                }
              }}
              onApiCallsPerDayChange={setQuickApiCallsPerDay}
              onDaysPerMonthChange={setQuickDaysPerMonth}
              onActiveUsersChange={setQuickActiveUsers}
              onInputIndexChange={setQuickInputIndex}
              onOutputIndexChange={setQuickOutputIndex}
            />
            <QuickResults
              copy={copy.quickEstimate}
              modelFilterCopy={copy.modelFilter}
              breakdowns={quickReport.models}
              cheapestId={quickReport.cheapestModelId}
              currency={currency}
              exchangeRate={exchangeRate}
              monthlyRequests={quickMonthlyRequests}
            />
            <SavingsComparison
              report={quickReport}
              copy={copy.savings}
              currency={currency}
              exchangeRate={exchangeRate}
            />
            <PricingSources
              copy={copy.sources}
              currency={currency}
              exchangeRate={exchangeRate}
              pricingSource={pricingSource}
              pricingUpdatedAt={pricingUpdatedAt}
              pricingHasCached={pricingHasCached}
              models={models}
            />
          </div>
        )}

        {/* Advanced Mode */}
        {primaryMode === "advanced" && (
          <div className="space-y-6">
            <ScenarioPresets
          activeId={activeScenarioId}
          copy={copy.scenarios}
          onSelect={handleSelectScenario}
        />
        {/* TODO(P0): 在 ScenarioPresets 下方、ScenarioParams 上方或同一行内，
          增加「缓存命中率」滑块（0% / 30% / 60% / 90%），
          影响后续 computeCostReport 的 freshInput / cachedInput 分拆计算。 */}
        <ScenarioParams
          params={scenarioParams}
          tokenEstimate={tokenEstimate}
          copy={copy.scenarioParams}
          estimatorCopy={copy.tokenEstimator}
          onChange={setScenarioParams}
        />
        <CalculationModeToggle
          mode={calculationMode}
          copy={copy.mode}
          onChange={setCalculationMode}
        />
        {calculationMode === "traffic" ? (
          <>
            <UsageForm usage={usage} copy={copy.usage} onChange={setUsage} />
            {/* TODO(P0): CostSummary 上方或内部增加 CostBreakdown（成本构成拆解）：
              显示 inputCost / outputCost / cachedInputCost / retryCost / fxImpact 各占多少。 */}
            {/* TODO(P0): CostSummary 下方增加 OptimizationTips（成本优化建议）：
              基于 output 占比、cache 可行性、batch 适用性等生成 3-5 条建议。
              来源：lib/recommendations.ts。 */}
            <CostSummary
              report={report}
              copy={copy.summary}
              currency={currency}
              exchangeRate={exchangeRate}
              models={models}
            />
            <SavingsComparison
              report={report}
              copy={copy.savings}
              currency={currency}
              exchangeRate={exchangeRate}
            />
            <ModelComparison
              report={report}
              copy={copy.comparison}
              currency={currency}
              exchangeRate={exchangeRate}
              selectedModelIds={selectedModelIds}
              onClear={() => setSelectedModelIds([])}
            />
            <CostTable
              report={report}
              copy={copy.table}
              modelFilterCopy={copy.modelFilter}
              currency={currency}
              exchangeRate={exchangeRate}
              selectedModelIds={selectedModelIds}
              onSelectedModelIdsChange={setSelectedModelIds}
            />
            {/* TODO(P1): CostTable 下方增加 ModelCombo（模型组合推荐）：
              A. 全程高质量；B. 80% 便宜 + 20% 高质量；C. 批处理/便宜模型优先。
              给出月成本、节省比例、适合场景。来源：lib/combo.ts。 */}
          </>
        ) : (
          <>
            {/* TODO(P0): BudgetMode 内部表格下方增加「预算反推 DAU」区块，
              显示：estimatedDAU / estimatedRequestsPerUserPerDay / monthlyRequests。 */}
            <BudgetMode
              budget={monthlyBudget}
              report={budgetReport}
              copy={copy.budget}
              modelFilterCopy={copy.modelFilter}
              onBudgetChange={setMonthlyBudget}
              currency={currency}
              exchangeRate={exchangeRate}
            />
          </>
        )}
        <PricingSources
          copy={copy.sources}
          currency={currency}
          exchangeRate={exchangeRate}
          pricingSource={pricingSource}
          pricingUpdatedAt={pricingUpdatedAt}
          pricingHasCached={pricingHasCached}
          models={models}
        />
        <KnownLimitations copy={copy.limitations} />
          </div>
        )}

        {/* Shared footer - always visible */}
        <footer className="pt-2 text-xs text-zinc-500 dark:text-zinc-500">
          {copy.hero.footer}
        </footer>
      </main>
    </div>
  );
}

function PrimaryModeToggle({
  mode,
  copy,
  onChange,
}: {
  mode: PrimaryMode;
  copy: AppCopy["primaryMode"];
  onChange: (mode: PrimaryMode) => void;
}) {
  const options: Array<{ id: PrimaryMode; label: string; description: string }> = [
    {
      id: "quick",
      label: copy.quick,
      description: copy.quickDescription,
    },
    {
      id: "advanced",
      label: copy.advanced,
      description: copy.advancedDescription,
    },
  ];
  const activeIndex = options.findIndex((o) => o.id === mode);

  return (
    <section aria-labelledby="primary-mode-heading" className="space-y-3">
      <div
        role="tablist"
        className="relative flex gap-1 rounded-lg border border-zinc-200 bg-zinc-100/70 p-1 dark:border-zinc-800 dark:bg-zinc-900/60"
      >
        {/* sliding indicator */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-white shadow-sm ring-1 ring-zinc-900/5 transition-transform duration-200 ease-out dark:bg-zinc-100"
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
            transitionProperty: "transform, width",
          }}
        />
        {options.map((option) => {
          const active = option.id === mode;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(option.id)}
              className={[
                "relative z-10 flex-1 min-w-0 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
                "dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-900",
                active
                  ? "text-zinc-900 dark:text-zinc-950"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CalculationModeToggle({
  mode,
  copy,
  onChange,
}: {
  mode: CalculationMode;
  copy: AppCopy["mode"];
  onChange: (mode: CalculationMode) => void;
}) {
  const options: Array<{
    id: CalculationMode;
    label: string;
    description: string;
  }> = [
    {
      id: "traffic",
      label: copy.trafficMode,
      description: copy.trafficDescription,
    },
    {
      id: "budget",
      label: copy.budgetMode,
      description: copy.budgetDescription,
    },
  ];

  return (
    <section aria-labelledby="mode-heading" className="space-y-3">
      <div>
        <h2
          id="mode-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {copy.heading}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {copy.description}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = option.id === mode;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={[
                "rounded-xl border p-4 text-left transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
                "dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-900",
                active
                  ? "border-zinc-900 bg-zinc-900/[0.04] text-zinc-900 dark:border-zinc-100 dark:bg-white/[0.06] dark:text-zinc-100"
                  : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-900/[0.03] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-white/[0.04]",
              ].join(" ")}
            >
              <span className="block text-sm font-semibold">
                {option.label}
              </span>
              <span
                className={[
                  "mt-1 block text-xs transition-colors duration-150",
                  active
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "text-zinc-500 dark:text-zinc-500",
                ].join(" ")}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CurrencyToggleButton({
  label,
  rateLabel,
  fxSource,
  children,
  onClick,
}: {
  label: string;
  rateLabel: string;
  fxSource: FxSource;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="group relative">
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
      <div
        role="tooltip"
        className={[
          "pointer-events-none absolute right-0 top-full z-20 mt-2 w-max max-w-[16rem]",
          "rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 shadow-md",
          "opacity-0 translate-y-1 transition duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0",
          "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200",
        ].join(" ")}
      >
        <div className="font-medium">{rateLabel}</div>
        <div
          className={[
            "mt-0.5 text-[10px] uppercase tracking-wide",
            fxSource === "live"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400",
          ].join(" ")}
        >
          {fxSource === "live" ? "live" : "fallback"}
        </div>
      </div>
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

function DollarIcon() {
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
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function YuanIcon() {
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
      <path d="M12 2v20M6 9h12a2 2 0 0 1 0 4H9a2 2 0 0 0 0 4h8a2 2 0 0 1 0 4H6" />
    </svg>
  );
}
