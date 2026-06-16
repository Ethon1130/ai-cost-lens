import { safeDivide, toSafeNumber } from "./safeNumber";
import type { ModelCostBreakdown, ModelPrice } from "./pricing";

const DAYS_PER_MONTH = 30;

/** Core usage assumptions, all already passed through toSafeNumber. */
export interface UsageInput {
  dailyUsers: number;
  requestsPerUserPerDay: number;
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
}

/**
 * Sanitize raw form / URL values into a non-negative UsageInput.
 * Every field goes through `toSafeNumber` so the calculator never sees bad data.
 */
export function sanitizeUsage(input: {
  dailyUsers: unknown;
  requestsPerUserPerDay: unknown;
  avgInputTokens: unknown;
  avgOutputTokens: unknown;
}): UsageInput {
  return {
    dailyUsers: toSafeNumber(input.dailyUsers, 0),
    requestsPerUserPerDay: toSafeNumber(input.requestsPerUserPerDay, 0),
    avgInputTokens: toSafeNumber(input.avgInputTokens, 0),
    avgOutputTokens: toSafeNumber(input.avgOutputTokens, 0),
  };
}

export function computeMonthlyRequests(usage: UsageInput): number {
  return usage.dailyUsers * usage.requestsPerUserPerDay * DAYS_PER_MONTH;
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
  const costPer1KRequests =
    safeDivide(totalCost, monthlyRequests, 0) * 1000;

  return {
    model,
    monthlyRequests,
    monthlyInputTokens,
    monthlyOutputTokens,
    inputCost,
    outputCost,
    totalCost,
    costPer1KRequests,
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
  for (const b of breakdowns) {
    if (b.totalCost <= 0) continue;
    if (cheapest === null || b.totalCost < cheapest.totalCost) {
      cheapest = b;
    }
  }

  return {
    monthlyRequests,
    monthlyInputTokens,
    monthlyOutputTokens,
    models: breakdowns,
    cheapestModelId: cheapest?.model.model ?? null,
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
