/**
 * Manual snapshot of official AI API pricing.
 *
 * Source policy (see AGENTS.md section 5):
 *   - Each model records the official pricing page it was taken from (`sourceUrl`)
 *     and the date it was verified (`checkedDate`).
 *   - These numbers are an estimate snapshot, not a billing dashboard.
 *   - Aggregator sources (OpenRouter, LiteLLM) are NOT used as the primary
 *     source; they may only appear as optional references in future work.
 *
 * Prices are USD per 1,000,000 tokens (i.e. per 1M).
 *
 * P1+: For live pricing data, use getLlmPricesData() from llmPricesApi.ts
 * which fetches from simonw/llm-prices API.
 */

export type Provider =
  | "OpenAI"
  | "Anthropic"
  | "Google"
  | "DeepSeek"
  | "Moonshot"
  | "xAI"
  | "Qwen"
  | "Mistral"
  | "Amazon"
  | "Minimax";

export interface ModelPrice {
  /** Provider display name, e.g. "OpenAI". */
  provider: Provider;
  /** Model identifier as it appears in the API. */
  model: string;
  /** Human-friendly label shown in the UI. */
  displayName: string;
  /** USD per 1,000,000 input tokens. */
  inputPer1M: number;
  /** USD per 1,000,000 output tokens. */
  outputPer1M: number;
  /** Maximum context window in tokens (informational only). */
  contextWindow?: number;
  /** Official pricing page URL. */
  sourceUrl: string;
  /** Date this price was last verified, ISO yyyy-mm-dd. */
  checkedDate: string;
  /** Optional short note about tier, region, or pricing caveats. */
  notes?: string;

  /**
   * USD per 1,000,000 tokens for cached input (prompt caching).
   * Only available for providers that support prompt caching:
   * - OpenAI: cached input ≈ 10% of regular input
   * - Google Gemini: cached input ≈ 50% of regular input
   * - Anthropic: cache read is priced separately
   * - DeepSeek, Kimi (Moonshot): cached input available
   *
   * null or undefined means caching not supported or not available.
   */
  cachedInputPer1M?: number;
}

export const MODELS: ModelPrice[] = [
  {
    provider: "OpenAI",
    model: "gpt-4o-mini",
    displayName: "GPT-4o mini",
    inputPer1M: 0.15,
    outputPer1M: 0.6,
    contextWindow: 128_000,
    sourceUrl:
      "https://platform.openai.com/docs/models/gpt-4o-mini",
    checkedDate: "2025-10-15",
    notes: "OpenAI public API pricing for gpt-4o-mini.",
  },
  {
    provider: "OpenAI",
    model: "gpt-4o",
    displayName: "GPT-4o",
    inputPer1M: 2.5,
    outputPer1M: 10.0,
    contextWindow: 128_000,
    sourceUrl: "https://platform.openai.com/docs/models/gpt-4o",
    checkedDate: "2025-10-15",
    notes: "OpenAI public API pricing for gpt-4o.",
  },
  {
    provider: "Anthropic",
    model: "claude-3-5-haiku-latest",
    displayName: "Claude 3.5 Haiku",
    inputPer1M: 0.8,
    outputPer1M: 4.0,
    contextWindow: 200_000,
    sourceUrl: "https://www.anthropic.com/pricing",
    checkedDate: "2025-10-15",
    notes: "Anthropic public API pricing for Claude 3.5 Haiku.",
  },
  {
    provider: "Anthropic",
    model: "claude-3-5-sonnet-latest",
    displayName: "Claude 3.5 Sonnet",
    inputPer1M: 3.0,
    outputPer1M: 15.0,
    contextWindow: 200_000,
    sourceUrl: "https://www.anthropic.com/pricing",
    checkedDate: "2025-10-15",
    notes: "Anthropic public API pricing for Claude 3.5 Sonnet.",
  },
  {
    provider: "Google",
    model: "gemini-1.5-flash",
    displayName: "Gemini 1.5 Flash",
    inputPer1M: 0.075,
    outputPer1M: 0.3,
    contextWindow: 1_000_000,
    sourceUrl: "https://ai.google.dev/pricing",
    checkedDate: "2025-10-15",
    notes:
      "Google AI Studio / Gemini API pricing for Gemini 1.5 Flash (<=128k context tier).",
  },
  {
    provider: "Google",
    model: "gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    inputPer1M: 1.25,
    outputPer1M: 5.0,
    contextWindow: 2_000_000,
    sourceUrl: "https://ai.google.dev/pricing",
    checkedDate: "2025-10-15",
    notes:
      "Google AI Studio / Gemini API pricing for Gemini 1.5 Pro (<=128k context tier).",
  },
];

export interface ModelCostBreakdown {
  model: ModelPrice;
  monthlyRequests: number;
  monthlyInputTokens: number;
  monthlyOutputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  costPerRequest: number;
  costPer1KRequests: number;
  costPerActiveUserPerMonth: number;
}

// =============================================================================
// Helper functions
// =============================================================================

/**
 * Get all token-based models grouped by provider.
 *
 * Note: For live pricing data, use getLlmPricesData() from llmPricesApi.ts.
 */
export function getModelsByProvider(): Record<Provider, ModelPrice[]> {
  const grouped: Partial<Record<Provider, ModelPrice[]>> = {};

  for (const m of MODELS) {
    if (!grouped[m.provider]) {
      grouped[m.provider] = [];
    }
    grouped[m.provider]!.push(m);
  }

  return grouped as Record<Provider, ModelPrice[]>;
}

export function getLatestCheckedDate(models: ModelPrice[] = MODELS): string {
  if (models.length === 0) return "N/A";
  return [...models.map((m) => m.checkedDate)].sort().reverse()[0]!;
}
