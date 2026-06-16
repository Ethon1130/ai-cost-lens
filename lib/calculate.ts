import { safeDivide, toSafeNumber } from "./safeNumber";
import type { ModelCostBreakdown, ModelPrice } from "./pricing";

/** Core usage assumptions, all already passed through toSafeNumber. */
export interface UsageInput {
  requestsPerDay: number;
  daysPerMonth: number;
  activeUsers: number;
  avgInputTokens: number;
  avgOutputTokens: number;
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

function computeForModel(
  model: ModelPrice,
  usage: UsageInput,
  monthlyRequests: number,
): ModelCostBreakdown {
  const monthlyInputTokens = monthlyRequests * usage.avgInputTokens;
  const monthlyOutputTokens = monthlyRequests * usage.avgOutputTokens;
  const inputCost =
    (monthlyInputTokens / 1_000_000) * model.inputPer1M;
  const outputCost =
    (monthlyOutputTokens / 1_000_000) * model.outputPer1M;
  const totalCost = inputCost + outputCost;
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

  let cheapest: ModelCostBreakdown | null = null;
  let mostExpensive: ModelCostBreakdown | null = null;
  for (const b of breakdowns) {
    if (b.totalCost <= 0) continue;
    if (cheapest === null || b.totalCost < cheapest.totalCost) {
      cheapest = b;
    }
    if (mostExpensive === null || b.totalCost > mostExpensive.totalCost) {
      mostExpensive = b;
    }
  }

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
