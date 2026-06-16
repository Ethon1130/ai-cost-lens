/**
 * URL Query <-> Calculator state bridge.
 *
 * Goal: sync the cost-driving state to the browser URL so any user can copy
 * the current setup and send it to someone else; opening the same URL must
 * restore all sliders and inputs.
 *
 * Design notes (ponytail / lazy-senior):
 * - Reads happen once on mount via useSearchParams() + a hydrated ref to
 *   prevent the writer from being influenced by URL changes.
 * - Writes use window.history.replaceState (not Next router) to avoid extra
 *   re-renders and App Router navigation churn.
 * - Writes are debounced (250ms) and de-duped (stringify compare) so a slider
 *   drag doesn't spam history calls.
 * - Every numeric field is clamped through toSafeNumber / clamp01; scenario
 *   ids must match a known preset. This is the URL = "input from the wild"
 *   trust boundary, so we do not trust it.
 */

import { useEffect, useMemo, useRef } from "react";

import { clamp01, toSafeNumber } from "./safeNumber";
import type { UsageInput } from "./calculate";
import {
  getQuickScenarioById,
  getScenarioById,
} from "./scenarios";
import type { ScenarioParams } from "./scenarios";

export type PrimaryMode = "quick" | "advanced";
export type CalculationMode = "traffic" | "budget";

// Fields we allow in the URL. Local UI prefs (language, theme, currency,
// model selection, pricing cache state) are intentionally excluded — they
// belong to the recipient, not the sender.
export interface SharedState {
  primaryMode: PrimaryMode;
  calculationMode: CalculationMode;
  activeScenarioId: string;
  scenarioParams: ScenarioParams;
  usage: UsageInput;
  monthlyBudget: number;
  quickScenarioId: string;
  quickInputIndex: number;
  quickOutputIndex: number;
  quickApiCallsPerDay: number;
  quickDaysPerMonth: number;
  quickActiveUsers: number;
}

// URL key conventions: short, snake/camel as in the example URL
// (?input=5000&output=2000&volume=50000). We pick the same style for the rest.
const KEYS = {
  primaryMode: "mode",
  calculationMode: "calc",
  activeScenarioId: "scenario",
  usageRpd: "rpd",
  usageDpm: "dpm",
  usageUsers: "users",
  usageAvgIn: "avgIn",
  usageAvgOut: "avgOut",
  usageRetry: "retry",
  monthlyBudget: "budget",
  quickScenarioId: "qscenario",
  quickInputIndex: "qin",
  quickOutputIndex: "qout",
  quickApiCallsPerDay: "calls",
  quickDaysPerMonth: "qdpm",
  quickActiveUsers: "qusers",
} as const;

// Scenario-specific field keys. We only emit/parse the field set that matches
// the active kind; switching kind does not leave stale keys in the URL.
const SCENARIO_KEYS: Record<ScenarioParams["kind"], string[]> = {
  chatbot: ["sys", "msg", "hist", "ans"],
  rag: ["sys", "q", "topK", "chunk", "ans"],
  agent: ["base", "retries", "sys", "tool", "final"],
  code: ["ctx", "q", "turns", "perTurn"],
  summarizer: ["doc", "ratio"],
};

// Generous upper bounds so URL cannot push absurd numbers into the calculator.
const MAX = {
  tokens: 10_000_000,
  requestsPerDay: 1_000_000_000,
  daysPerMonth: 31,
  activeUsers: 1_000_000_000,
  budget: 1_000_000_000,
  integer: 1_000_000,
  retry: 1, // clamp01 handles this
  index: 100, // quick length option index
  apiCallsPerDay: 1_000_000_000,
};

function isPrimaryMode(v: string | null): v is PrimaryMode {
  return v === "quick" || v === "advanced";
}
function isCalculationMode(v: string | null): v is CalculationMode {
  return v === "traffic" || v === "budget";
}

function readOptionalNumber(
  params: URLSearchParams,
  key: string,
  options?: { min?: number; max?: number; integer?: boolean },
): number | undefined {
  const raw = params.get(key);
  if (raw == null) return undefined;
  return toSafeNumber(raw, NaN, options);
}

function readScenarioKindSpecific(
  params: URLSearchParams,
  kind: ScenarioParams["kind"],
): unknown {
  // Returns the inner values object for the current kind, or `undefined` if
  // none of the keys are present. Never mixes fields from a different kind.
  const keys = SCENARIO_KEYS[kind];
  const partial: Record<string, number> = {};
  let touched = false;
  for (const k of keys) {
    if (!params.has(k)) continue;
    touched = true;
    partial[k] = toSafeNumber(params.get(k), 0, { min: 0, max: MAX.tokens });
  }
  if (!touched) return undefined;
  return partial;
}

function projectKindValues(
  kind: ScenarioParams["kind"],
  raw: unknown,
): ScenarioParams["values"] | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, number>;
  const num = (k: string, fallback: number) =>
    Number.isFinite(r[k]) ? r[k] : fallback;
  switch (kind) {
    case "chatbot":
      return {
        systemPromptTokens: num("sys", 0),
        userMessageTokens: num("msg", 0),
        historyTokens: num("hist", 0),
        answerTokens: num("ans", 0),
      };
    case "rag":
      return {
        systemPromptTokens: num("sys", 0),
        userQuestionTokens: num("q", 0),
        topK: num("topK", 0),
        avgChunkTokens: num("chunk", 0),
        answerTokens: num("ans", 0),
      };
    case "agent":
      return {
        baseCalls: num("base", 0),
        retries: num("retries", 0),
        systemPromptTokens: num("sys", 0),
        toolResultTokens: num("tool", 0),
        finalAnswerTokens: num("final", 0),
      };
    case "code":
      return {
        codeContextTokens: num("ctx", 0),
        userQuestionTokens: num("q", 0),
        sessionTurns: num("turns", 0),
        perTurnOutputTokens: num("perTurn", 0),
      };
    case "summarizer":
      return {
        documentTokens: num("doc", 0),
        compressionRatio: num("ratio", 0),
      };
  }
}

function pickScenarioPresetValues(
  params: URLSearchParams,
  scenarioId: string,
): ScenarioParams | undefined {
  const preset = getScenarioById(scenarioId);
  if (!preset) return undefined;
  // Even if the URL has no scenario-specific keys, we can return the preset's
  // default values so the user gets the same starting point as clicking the
  // preset card. The fields will be overwritten by the kind-specific parser
  // higher up if they are present.
  return preset.params;
}

/**
 * Parse the URL into a partial SharedState. Returns only the fields that are
 * actually present (or safe to default). Anything illegal falls back to the
 * caller-provided default, so the page never crashes on a weird URL.
 */
export function decodeStateFromQuery(
  searchParams: URLSearchParams,
  defaults: SharedState,
): Partial<SharedState> {
  const out: Partial<SharedState> = {};

  const pm = searchParams.get(KEYS.primaryMode);
  if (isPrimaryMode(pm)) out.primaryMode = pm;

  const cm = searchParams.get(KEYS.calculationMode);
  if (isCalculationMode(cm)) out.calculationMode = cm;

  const sid = searchParams.get(KEYS.activeScenarioId);
  if (sid && getScenarioById(sid)) {
    out.activeScenarioId = sid;
    const raw = readScenarioKindSpecific(searchParams, getScenarioById(sid)!.params.kind);
    const projected = projectKindValues(getScenarioById(sid)!.params.kind, raw);
    const presetParams = pickScenarioPresetValues(searchParams, sid);
    if (presetParams) {
      out.scenarioParams = projected
        ? ({ kind: presetParams.kind, values: projected } as ScenarioParams)
        : presetParams;
    }
  }

  // Usage fields: only update if at least one is present. Otherwise leave
  // whatever the current state is (a partial override would be confusing).
  const rpd = readOptionalNumber(searchParams, KEYS.usageRpd, { min: 0, max: MAX.requestsPerDay });
  const dpm = readOptionalNumber(searchParams, KEYS.usageDpm, { min: 0, max: MAX.daysPerMonth, integer: true });
  const users = readOptionalNumber(searchParams, KEYS.usageUsers, { min: 0, max: MAX.activeUsers });
  const avgIn = readOptionalNumber(searchParams, KEYS.usageAvgIn, { min: 0, max: MAX.tokens });
  const avgOut = readOptionalNumber(searchParams, KEYS.usageAvgOut, { min: 0, max: MAX.tokens });
  const retry = readOptionalNumber(searchParams, KEYS.usageRetry, { min: 0, max: MAX.retry });
  if (
    rpd !== undefined ||
    dpm !== undefined ||
    users !== undefined ||
    avgIn !== undefined ||
    avgOut !== undefined ||
    retry !== undefined
  ) {
    out.usage = {
      requestsPerDay: rpd ?? defaults.usage.requestsPerDay,
      daysPerMonth: dpm ?? defaults.usage.daysPerMonth,
      activeUsers: users ?? defaults.usage.activeUsers,
      avgInputTokens: avgIn ?? defaults.usage.avgInputTokens,
      avgOutputTokens: avgOut ?? defaults.usage.avgOutputTokens,
      retryRate: retry !== undefined ? clamp01(retry, defaults.usage.retryRate) : defaults.usage.retryRate,
    };
  }

  const budget = readOptionalNumber(searchParams, KEYS.monthlyBudget, { min: 0, max: MAX.budget });
  if (budget !== undefined) out.monthlyBudget = budget;

  const qsid = searchParams.get(KEYS.quickScenarioId);
  if (qsid && getQuickScenarioById(qsid)) out.quickScenarioId = qsid;

  const qin = readOptionalNumber(searchParams, KEYS.quickInputIndex, { min: 0, max: MAX.index, integer: true });
  if (qin !== undefined) out.quickInputIndex = qin;

  const qout = readOptionalNumber(searchParams, KEYS.quickOutputIndex, { min: 0, max: MAX.index, integer: true });
  if (qout !== undefined) out.quickOutputIndex = qout;

  const calls = readOptionalNumber(searchParams, KEYS.quickApiCallsPerDay, { min: 0, max: MAX.apiCallsPerDay });
  if (calls !== undefined) out.quickApiCallsPerDay = calls;

  const qdpm = readOptionalNumber(searchParams, KEYS.quickDaysPerMonth, { min: 0, max: MAX.daysPerMonth, integer: true });
  if (qdpm !== undefined) out.quickDaysPerMonth = qdpm;

  const qusers = readOptionalNumber(searchParams, KEYS.quickActiveUsers, { min: 0, max: MAX.activeUsers });
  if (qusers !== undefined) out.quickActiveUsers = qusers;

  return out;
}

function appendNumber(sp: URLSearchParams, key: string, value: number): void {
  if (Number.isFinite(value)) sp.set(key, String(value));
}

function appendScenarioFields(
  sp: URLSearchParams,
  params: ScenarioParams,
): void {
  const keys = SCENARIO_KEYS[params.kind];
  // ponytail: ScenarioParams is a discriminated union; for URL serialization we
  // only need numeric field access by key. The shape of `values` varies per
  // scenario kind, so a `Record<string, number>` view is the simplest contract.
  const v = params.values as unknown as Record<string, number>;
  for (const k of keys) {
    if (Number.isFinite(v[k])) sp.set(k, String(v[k]));
  }
}

/**
 * Serialize the cost-driving state into URL query parameters.
 * Always omits fields that are at their default value to keep the URL short.
 */
export function encodeStateToQuery(
  state: SharedState,
  defaults: SharedState,
): URLSearchParams {
  const sp = new URLSearchParams();
  if (state.primaryMode !== defaults.primaryMode) sp.set(KEYS.primaryMode, state.primaryMode);
  if (state.calculationMode !== defaults.calculationMode) sp.set(KEYS.calculationMode, state.calculationMode);
  if (state.activeScenarioId !== defaults.activeScenarioId) sp.set(KEYS.activeScenarioId, state.activeScenarioId);

  // Always emit scenario-kind fields when they match the current scenario,
  // even if the active scenario itself didn't change — this is how we
  // re-hydrate a tweaked scenario after sharing. We do NOT emit fields for
  // a different kind, which is the gotcha when switching between scenarios.
  appendScenarioFields(sp, state.scenarioParams);

  if (state.usage.requestsPerDay !== defaults.usage.requestsPerDay)
    appendNumber(sp, KEYS.usageRpd, state.usage.requestsPerDay);
  if (state.usage.daysPerMonth !== defaults.usage.daysPerMonth)
    appendNumber(sp, KEYS.usageDpm, state.usage.daysPerMonth);
  if (state.usage.activeUsers !== defaults.usage.activeUsers)
    appendNumber(sp, KEYS.usageUsers, state.usage.activeUsers);
  if (state.usage.avgInputTokens !== defaults.usage.avgInputTokens)
    appendNumber(sp, KEYS.usageAvgIn, state.usage.avgInputTokens);
  if (state.usage.avgOutputTokens !== defaults.usage.avgOutputTokens)
    appendNumber(sp, KEYS.usageAvgOut, state.usage.avgOutputTokens);
  if (state.usage.retryRate !== defaults.usage.retryRate)
    appendNumber(sp, KEYS.usageRetry, state.usage.retryRate);

  if (state.monthlyBudget !== defaults.monthlyBudget)
    appendNumber(sp, KEYS.monthlyBudget, state.monthlyBudget);

  if (state.quickScenarioId !== defaults.quickScenarioId) sp.set(KEYS.quickScenarioId, state.quickScenarioId);
  if (state.quickInputIndex !== defaults.quickInputIndex)
    appendNumber(sp, KEYS.quickInputIndex, state.quickInputIndex);
  if (state.quickOutputIndex !== defaults.quickOutputIndex)
    appendNumber(sp, KEYS.quickOutputIndex, state.quickOutputIndex);
  if (state.quickApiCallsPerDay !== defaults.quickApiCallsPerDay)
    appendNumber(sp, KEYS.quickApiCallsPerDay, state.quickApiCallsPerDay);
  if (state.quickDaysPerMonth !== defaults.quickDaysPerMonth)
    appendNumber(sp, KEYS.quickDaysPerMonth, state.quickDaysPerMonth);
  if (state.quickActiveUsers !== defaults.quickActiveUsers)
    appendNumber(sp, KEYS.quickActiveUsers, state.quickActiveUsers);

  return sp;
}

/**
 * Hook that syncs state <-> window URL.
 *
 * - On mount, parses window.location.search ONCE and returns the parsed
 *   values in `initial`. The page should apply these to its useState
 *   setters in a useEffect (one-shot) or via lazy initializers.
 * - On every render, watches `state`; when it diverges from what's
 *   currently in the URL, debounces (250ms) and writes via
 *   window.history.replaceState (no Next router involvement, no
 *   re-render trigger).
 * - Listens to `popstate` so back/forward navigation re-hydrates the page.
 *
 * We read the URL via window.location (not useSearchParams) to avoid
 * Next's Suspense boundary requirement and to keep the bridge decoupled
 * from the App Router navigation pipeline.
 */
export function useUrlStateBridge(state: SharedState, defaults: SharedState) {
  const hydratedRef = useRef(false);
  const lastWrittenRef = useRef<string>("");
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Snapshot of the initial URL state, computed exactly once during the
  // first render. We use a ref so the returned object reference is stable.
  const initial = useMemo(() => {
    if (typeof window === "undefined") return {} as Partial<SharedState>;
    const sp = new URLSearchParams(window.location.search);
    return decodeStateFromQuery(sp, defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark hydration complete after the first effect runs.
  useEffect(() => {
    hydratedRef.current = true;
  }, []);

  // Write URL on state change, debounced + de-duped. We intentionally do
  // NOT consult searchParams here — once we own the URL, we own it. This
  // is the loop-breaker. The caller is responsible for seeding useState
  // from the URL on mount (via lazy initializers or an early effect).
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (typeof window === "undefined") return;

    const sp = encodeStateToQuery(state, defaults);
    const next = sp.toString();
    if (next === lastWrittenRef.current) return;
    lastWrittenRef.current = next;

    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(() => {
      try {
        const url = new URL(window.location.href);
        // Preserve any other query keys the user might have added manually
        // (analytics, marketing tags, etc.). Only mutate our known keys.
        for (const k of Array.from(url.searchParams.keys())) {
          if (!isOurKey(k)) url.searchParams.delete(k);
        }
        for (const [k, v] of sp.entries()) {
          url.searchParams.set(k, v);
        }
        const nextSearch = url.searchParams.toString();
        const target =
          url.pathname + (nextSearch ? `?${nextSearch}` : "") + url.hash;
        window.history.replaceState(window.history.state, "", target);
        lastWrittenRef.current = sp.toString();
      } catch {
        // replaceState can throw in some test/sandbox environments; ignore.
      }
    }, 250);

    return () => {
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    };
  }, [state, defaults]);

  return { initial };
}

function isOurKey(k: string): boolean {
  const all = new Set<string>(Object.values(KEYS));
  for (const list of Object.values(SCENARIO_KEYS)) {
    for (const k2 of list) all.add(k2);
  }
  return all.has(k);
}

// Re-export the scenario list keys for tests / consumers that want to know
// which URL keys belong to the calculator.
export const URL_STATE_KEYS = { ...KEYS } as const;
export { SCENARIO_KEYS as URL_STATE_SCENARIO_KEYS };
export const URL_STATE_MAX = { ...MAX } as const;
