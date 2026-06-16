/**
 * Currency helpers for AI Cost Lens.
 *
 * The calculator itself always works in USD (see lib/calculate.ts). The UI
 * layer formats numbers into USD or CNY using these helpers, so we never
 * pollute the calculation pipeline with currency state.
 *
 * The exchange rate is loaded once on the client from a free public FX API.
 * If the request fails, times out, or returns a non-positive value, the rate
 * falls back to FIXED_FALLBACK_RATE so the UI never shows NaN / Infinity.
 */

export type Currency = "USD" | "CNY";

/** Demo-only fixed fallback rate (1 USD -> CNY). Not a financial-grade quote. */
export const FIXED_FALLBACK_RATE = 7.25;

/** Public free FX endpoint; safe to call from the browser (no API key). */
const FX_ENDPOINT = "https://open.er-api.com/v6/latest/USD";

/** Hard ceiling for the FX request so a slow network never blocks the UI. */
const FX_TIMEOUT_MS = 5000;

/** localStorage key for persisting the user's currency preference. */
export const CURRENCY_STORAGE_KEY = "ai-cost-lens:currency";

const SYMBOL: Record<Currency, string> = { USD: "$", CNY: "￥" };

/** Safely convert a USD value into the target currency at the given rate. */
export function convertUsd(
  value: number,
  currency: Currency,
  rate: number,
): number {
  const safe = Number.isFinite(value) ? value : 0;
  const safeRate = Number.isFinite(rate) && rate > 0 ? rate : 1;
  if (currency === "USD") return safe;
  return safe * safeRate;
}

/**
 * Format a USD number as a string in the target currency.
 * Mirrors the precision rules that formatUsd used to apply: zero renders
 * as `0.00`, values below 1 render with 4 decimals, others with 2.
 */
export function formatCurrency(
  value: number,
  currency: Currency,
  rate: number,
): string {
  const converted = convertUsd(value, currency, rate);
  const symbol = SYMBOL[currency];
  if (converted === 0) return `${symbol}0.00`;
  if (Math.abs(converted) < 1) return `${symbol}${converted.toFixed(4)}`;
  return `${symbol}${converted.toFixed(2)}`;
}

export type FxSource = "live" | "fallback";

export interface FxResult {
  rate: number;
  source: FxSource;
}

/**
 * Best-effort fetch of the live USD -> CNY rate. Never throws; on any error
 * (network, timeout, missing/invalid field) it returns the fixed fallback.
 */
export async function loadExchangeRate(
  timeoutMs: number = FX_TIMEOUT_MS,
): Promise<FxResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(FX_ENDPOINT, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`FX HTTP ${res.status}`);
    }
    const data = (await res.json()) as { rates?: Record<string, number> };
    const cny = data?.rates?.CNY;
    if (typeof cny !== "number" || !Number.isFinite(cny) || cny <= 0) {
      throw new Error("FX response missing valid CNY rate");
    }
    return { rate: cny, source: "live" };
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn(
        "[ai-cost-lens] live FX rate unavailable, using fallback",
        err,
      );
    }
    return { rate: FIXED_FALLBACK_RATE, source: "fallback" };
  } finally {
    clearTimeout(timer);
  }
}
