/**
 * LLM Prices API client for fetching live pricing data from simonw/llm-prices.
 *
 * Source: https://github.com/simonw/llm-prices
 * API: https://www.llm-prices.com/current-v1.json
 *
 * This module provides:
 * - fetchLlmPrices(): Fetch raw pricing data with timeout and error handling
 * - mapToModelPrice(): Transform API response to internal ModelPrice format
 * - getLlmPricesData(): Combined fetch + transform + fallback logic
 */

import type { ModelPrice, Provider } from "./pricing";

export interface LlmPricesPrice {
  id: string;
  vendor: string;
  name: string;
  input: number;
  output: number;
  input_cached: number | null;
}

export interface LlmPricesResponse {
  updated_at: string;
  prices: LlmPricesPrice[];
}

// Mapping from vendor strings in API response to internal Provider type
const VENDOR_TO_PROVIDER: Record<string, Provider> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  deepseek: "DeepSeek",
  moonshot: "Moonshot",
  xai: "xAI",
  qwen: "Qwen",
  mistral: "Mistral",
  amazon: "Amazon",
  minimax: "Minimax",
};

/**
 * Fetch pricing data from simonw/llm-prices API.
 *
 * @param timeoutMs - Request timeout in milliseconds (default: 5000)
 * @returns Parsed JSON response or null on failure
 */
export async function fetchLlmPrices(
  timeoutMs = 5000
): Promise<LlmPricesResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch("https://www.llm-prices.com/current-v1.json", {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(
        `[llmPricesApi] Failed to fetch: HTTP ${res.status} ${res.statusText}`
      );
      return null;
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.warn("[llmPricesApi] Request timed out");
      } else {
        console.warn(`[llmPricesApi] Fetch error: ${error.message}`);
      }
    }
    return null;
  }
}

/**
 * Transform an LLM Prices API price entry to internal ModelPrice format.
 *
 * Note: input_cached is stored separately; for now it's included in notes.
 * Full cachedInputPer1M support is handled in pricing.ts.
 */
export function mapToModelPrice(
  p: LlmPricesPrice,
  updatedAt: string
): Omit<ModelPrice, "cachedInputPer1M"> {
  const provider = VENDOR_TO_PROVIDER[p.vendor.toLowerCase()] ?? p.vendor;

  const notes: string[] = [
    `Price snapshot via simonw/llm-prices (${updatedAt})`,
  ];

  if (p.input_cached !== null) {
    notes.push(
      `Cached input: $${p.input_cached.toFixed(4)}/1M tokens`
    );
  }

  return {
    provider: provider as Provider,
    model: p.id,
    displayName: p.name,
    inputPer1M: p.input,
    outputPer1M: p.output,
    sourceUrl: "https://www.llm-prices.com",
    checkedDate: updatedAt,
    notes: notes.join(" | "),
  };
}

// Allowed providers for filtering
const ALLOWED_PROVIDERS = new Set(["OpenAI", "Anthropic", "Google"]);

/**
 * Combined data fetching with automatic fallback to static MODELS.
 * Filters to only include OpenAI, Anthropic, and Google (Gemini) models.
 *
 * @returns Object containing:
 *   - models: Array of ModelPrice (from API or fallback)
 *   - updatedAt: Date string of the data (API date or fallback date)
 *   - source: "api" if fetched successfully, "fallback" otherwise
 *   - cachedInputPer1M: Whether the data includes cached input prices
 */
export async function getLlmPricesData(): Promise<{
  models: ModelPrice[];
  updatedAt: string;
  source: "api" | "fallback";
  hasCachedPrices: boolean;
}> {
  const apiData = await fetchLlmPrices();

  if (apiData) {
    const hasCachedPrices = apiData.prices.some(
      (p) => p.input_cached !== null
    );

    // Filter to only allowed providers and remove duplicates by model ID
    const seen = new Set<string>();
    const models: ModelPrice[] = [];

    for (const p of apiData.prices) {
      const provider = VENDOR_TO_PROVIDER[p.vendor.toLowerCase()] ?? p.vendor;
      if (!ALLOWED_PROVIDERS.has(provider as string)) continue;
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      models.push({
        ...mapToModelPrice(p, apiData.updated_at),
        cachedInputPer1M: p.input_cached ?? undefined,
      } as ModelPrice);
    }

    return {
      models,
      updatedAt: apiData.updated_at,
      source: "api",
      hasCachedPrices,
    };
  }

  // Fallback is imported here to avoid circular dependency
  const { MODELS, getLatestCheckedDate } = await import("./pricing");

  // Filter fallback to only allowed providers
  const filteredFallback = MODELS.filter((m) => ALLOWED_PROVIDERS.has(m.provider));

  return {
    models: filteredFallback,
    updatedAt: getLatestCheckedDate(filteredFallback),
    source: "fallback",
    hasCachedPrices: filteredFallback.some((m) => m.cachedInputPer1M !== undefined),
  };
}
