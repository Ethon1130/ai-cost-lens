import { clamp01, safeDivide, toSafeNumber } from "./safeNumber";
import type { ModelCostBreakdown, ModelPrice } from "./pricing";
import { formatCurrency, FIXED_FALLBACK_RATE } from "./currency";
import type { Currency } from "./currency";

export { formatCurrency };
export type { Currency };
/** Demo-only fixed FX rate; see lib/currency.ts. */
export const FALLBACK_FX_RATE = FIXED_FALLBACK_RATE;

/**
 * Core usage assumptions, all already passed through toSafeNumber.
 */
// TODO(P1): UsageInput 的 retryRate 已通过 clamp01 实现。
//   totalCost 乘数修正已写入 computeForModel。
export interface UsageInput {
  requestsPerDay: number;
  daysPerMonth: number;
  activeUsers: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  retryRate: number;
}

export interface CostReport {
  monthlyRequests: number;
  monthlyInputTokens: number;
  monthlyOutputTokens: number;
  models: ModelCostBreakdown[];
  /** Model with the strictly lowest total cost. `null` when no traffic. */
  cheapestModelId: string | null;
  /** Model with the highest total cost. `null` when no traffic. */
  mostExpensiveModelId: string | null;
  cheapestTotalCost: number;
  mostExpensiveTotalCost: number;
  savingsIfSwitchToCheapest: {
    fromModelId: string | null;
    toModelId: string | null;
    amount: number;
    percent: number;
  };
}

export interface BudgetModelBreakdown {
  model: ModelPrice;
  monthlyBudget: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  inputCostPerRequest: number;
  outputCostPerRequest: number;
  costPerRequest: number;
  costPer1KRequests: number;
  maxRequests: number;
  estimatedSpend: number;
  unusedBudget: number;
}

export interface BudgetReport {
  monthlyBudget: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  models: BudgetModelBreakdown[];
  bestValueModelId: string | null;
  bestValueRequests: number;
}

/**
 * Sanitize raw form / URL values into a non-negative UsageInput.
 * Every field goes through `toSafeNumber` so the calculator never sees bad data.
 */
export function sanitizeUsage(input: {
  requestsPerDay: unknown;
  daysPerMonth: unknown;
  activeUsers: unknown;
  avgInputTokens: unknown;
  avgOutputTokens: unknown;
  retryRate?: unknown;
}): UsageInput {
  return {
    requestsPerDay: toSafeNumber(input.requestsPerDay, 0),
    daysPerMonth: toSafeNumber(input.daysPerMonth, 30, {
      min: 0,
      max: 31,
      integer: true,
    }),
    activeUsers: toSafeNumber(input.activeUsers, 0),
    avgInputTokens: toSafeNumber(input.avgInputTokens, 0),
    avgOutputTokens: toSafeNumber(input.avgOutputTokens, 0),
    retryRate: clamp01(input.retryRate, 0),
  };
}

export function computeMonthlyRequests(usage: UsageInput): number {
  const requestsPerDay = toSafeNumber(usage.requestsPerDay, 0);
  const daysPerMonth = toSafeNumber(usage.daysPerMonth, 30, {
    min: 0,
    max: 31,
    integer: true,
  });
  return requestsPerDay * daysPerMonth;
}

/**
 * Pick the breakdown with the lowest positive total cost, or `null` when every
 * row is non-positive. Returns the *object reference* — callers that need to
 * highlight "the cheapest row" should compare with `===`, never on
 * `breakdown.model.model` (a string), because duplicate / missing model ids
 * would otherwise light up more than one row.
 */
export function pickCheapest(
  breakdowns: ModelCostBreakdown[],
): ModelCostBreakdown | null {
  let best: ModelCostBreakdown | null = null;
  for (const b of breakdowns) {
    if (b.totalCost <= 0) continue;
    if (best === null || b.totalCost < best.totalCost) best = b;
  }
  return best;
}

/** Pick the breakdown with the highest total cost, or `null` when empty. */
export function pickMostExpensive(
  breakdowns: ModelCostBreakdown[],
): ModelCostBreakdown | null {
  let best: ModelCostBreakdown | null = null;
  for (const b of breakdowns) {
    if (b.totalCost <= 0) continue;
    if (best === null || b.totalCost > best.totalCost) best = b;
  }
  return best;
}

function computeForModel(
  model: ModelPrice,
  usage: UsageInput,
  monthlyRequests: number,
): ModelCostBreakdown {
  const monthlyInputTokens = monthlyRequests * usage.avgInputTokens;
  const monthlyOutputTokens = monthlyRequests * usage.avgOutputTokens;
  const inputCost =
    (monthlyInputTokens / 1_000_000) * (model.inputPer1M ?? 0);
  const outputCost =
    (monthlyOutputTokens / 1_000_000) * (model.outputPer1M ?? 0);
  const retryMultiplier = 1 + (usage.retryRate ?? 0);
  const totalCost = (inputCost + outputCost) * retryMultiplier;
  const costPerRequest = safeDivide(totalCost, monthlyRequests, 0);
  const costPer1KRequests =
    costPerRequest * 1000;
  const costPerActiveUserPerMonth = safeDivide(
    totalCost,
    usage.activeUsers,
    0,
  );

  return {
    model,
    monthlyRequests,
    monthlyInputTokens,
    monthlyOutputTokens,
    inputCost,
    outputCost,
    totalCost,
    costPerRequest,
    costPer1KRequests,
    costPerActiveUserPerMonth,
  };
}

/**
 * Compute monthly cost across every model for the given usage.
 * All numeric outputs are guaranteed finite (no NaN / Infinity).
 */
export function computeCostReport(
  usage: UsageInput,
  models: ModelPrice[],
): CostReport {
  const monthlyRequests = computeMonthlyRequests(usage);
  const monthlyInputTokens = monthlyRequests * usage.avgInputTokens;
  const monthlyOutputTokens = monthlyRequests * usage.avgOutputTokens;

  const breakdowns = models.map((m) =>
    computeForModel(m, usage, monthlyRequests),
  );

  const cheapest = pickCheapest(breakdowns);
  const mostExpensive = pickMostExpensive(breakdowns);

  const savingsAmount =
    cheapest && mostExpensive
      ? Math.max(mostExpensive.totalCost - cheapest.totalCost, 0)
      : 0;
  const savingsPercent =
    mostExpensive && mostExpensive.totalCost > 0
      ? safeDivide(savingsAmount, mostExpensive.totalCost, 0)
      : 0;

  return {
    monthlyRequests,
    monthlyInputTokens,
    monthlyOutputTokens,
    models: breakdowns,
    cheapestModelId: cheapest?.model.model ?? null,
    mostExpensiveModelId: mostExpensive?.model.model ?? null,
    cheapestTotalCost: cheapest?.totalCost ?? 0,
    mostExpensiveTotalCost: mostExpensive?.totalCost ?? 0,
    savingsIfSwitchToCheapest: {
      fromModelId: mostExpensive?.model.model ?? null,
      toModelId: cheapest?.model.model ?? null,
      amount: savingsAmount,
      percent: savingsPercent,
    },
  };
}

export function computeBudgetReport(
  input: {
    monthlyBudget: unknown;
    avgInputTokens: unknown;
    avgOutputTokens: unknown;
  },
  models: ModelPrice[],
): BudgetReport {
  const monthlyBudget = toSafeNumber(input.monthlyBudget, 0);
  const avgInputTokens = toSafeNumber(input.avgInputTokens, 0);
  const avgOutputTokens = toSafeNumber(input.avgOutputTokens, 0);

  const breakdowns = models
    .map((model) => {
      const inputCostPerRequest =
        (avgInputTokens / 1_000_000) * (model.inputPer1M ?? 0);
      const outputCostPerRequest =
        (avgOutputTokens / 1_000_000) * (model.outputPer1M ?? 0);
      const costPerRequest = inputCostPerRequest + outputCostPerRequest;
      const maxRequests =
        costPerRequest > 0
          ? Math.floor(safeDivide(monthlyBudget, costPerRequest, 0))
          : 0;
      const estimatedSpend = maxRequests * costPerRequest;
      const unusedBudget = Math.max(monthlyBudget - estimatedSpend, 0);

      return {
        model,
        monthlyBudget,
        avgInputTokens,
        avgOutputTokens,
        inputCostPerRequest,
        outputCostPerRequest,
        costPerRequest,
        costPer1KRequests: costPerRequest * 1000,
        maxRequests,
        estimatedSpend,
        unusedBudget,
      };
    })
    .sort((a, b) => {
      if (b.maxRequests !== a.maxRequests) {
        return b.maxRequests - a.maxRequests;
      }
      return a.costPerRequest - b.costPerRequest;
    });

  const bestValue = breakdowns.find((b) => b.maxRequests > 0) ?? null;

  return {
    monthlyBudget,
    avgInputTokens,
    avgOutputTokens,
    models: breakdowns,
    bestValueModelId: bestValue?.model.model ?? null,
    bestValueRequests: bestValue?.maxRequests ?? 0,
  };
}

/**
 * Format a number as USD with sensible precision for cost columns.
 * - Always returns a finite numeric string.
 * - Uses 4 decimals for tiny values (< 1), 2 decimals otherwise.
 */
export function formatUsd(value: number): string {
  const v = Number.isFinite(value) ? value : 0;
  if (v === 0) return "$0.00";
  if (Math.abs(v) < 1) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(2)}`;
}

/** Format a large token count with thousand separators. */
export function formatTokens(value: number): string {
  const v = Number.isFinite(value) ? value : 0;
  return v.toLocaleString("en-US");
}

/** Format a request count with thousand separators. */
export function formatRequests(value: number): string {
  return formatTokens(value);
}

export function formatPercent(value: number): string {
  const v = Number.isFinite(value) ? value : 0;
  return `${(v * 100).toFixed(1)}%`;
}

// =============================================================================
// Quick Estimation Mode (new)
// Simplified inputs for fast API-cost estimates
// =============================================================================

/**
 * Simplified usage input for quick estimation mode.
 * Developers select length options instead of raw token numbers.
 */
export interface QuickUsageInput {
  apiCallsPerDay: number;
  daysPerMonth: number;
  activeUsers?: number;
  avgInputTokens: number;
  avgOutputTokens: number;
}

/**
 * Convert quick mode inputs to standard UsageInput for cost calculation.
 * Quick mode calculates monthly requests as: apiCallsPerDay * daysPerMonth.
 */
export function quickToStandardUsage(input: QuickUsageInput): UsageInput {
  const apiCallsPerDay = toSafeNumber(input.apiCallsPerDay, 0);
  const daysPerMonth = toSafeNumber(input.daysPerMonth, 30, {
    min: 0,
    max: 31,
    integer: true,
  });
  return {
    requestsPerDay: apiCallsPerDay,
    daysPerMonth,
    activeUsers: toSafeNumber(input.activeUsers, 0),
    avgInputTokens: toSafeNumber(input.avgInputTokens, 0),
    avgOutputTokens: toSafeNumber(input.avgOutputTokens, 0),
    retryRate: 0,
  };
}

/**
 * Compute monthly requests from quick mode inputs.
 */
export function computeQuickMonthlyRequests(input: QuickUsageInput): number {
  const apiCallsPerDay = toSafeNumber(input.apiCallsPerDay, 0);
  const daysPerMonth = toSafeNumber(input.daysPerMonth, 30, {
    min: 0,
    max: 31,
    integer: true,
  });
  return apiCallsPerDay * daysPerMonth;
}
