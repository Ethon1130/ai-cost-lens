/**
 * AI Cost Lens —— 模型组合推荐引擎
 *
 * P1 功能。基于当前 pricing 快照和 usage，生成三种实用的模型组合方案，
 * 供开发者在真实产品中参考路由策略。
 *
 *   方案 A：全程高质量模型
 *     - 适用：正式产品、复杂问答、客服对话
 *     - 路由：100% 走用户选定的 anchor model
 *     - 成本：anchor 全价
 *     - 节省：相对 anchor 自身 = 0
 *
 *   方案 B：便宜模型优先 + 高级模型兜底（路由器）
 *     - 适用：客服/分类/简单问答
 *     - 路由：先 cheapRatio 比例的请求用最便宜模型处理，
 *            其余升级到 anchor model
 *     - 成本：cheapRatio * cost(cheapest) + (1 - cheapRatio) * cost(anchor)
 *     - 节省：相对 anchor 节省 = anchor - router
 *
 *   方案 C：批处理模式
 *     - 适用：日报总结、批量分析、离线任务
 *     - 路由：anchor model 走 batch API，input/output 各 50% 折扣
 *     - 限制：延迟最高 24h；provider 不支持 batch 时降级为 N/A
 *
 * ponytail: 简化实现 —— cheapModel 不按"复杂度分类"二次评估，直接用 cheapRatio 加权。
 * 升级路径：若用户接入真实路由器日志，可让 cheapRatio 来自真实命中率分布。
 */

import type { ModelPrice } from "./pricing";
import { computeMonthlyRequests } from "./calculate";
import { toSafeNumber, safeDivide } from "./safeNumber";
import { applyBatchDiscount, getBatchDiscount } from "./batch";
import type { UsageInput } from "./calculate";
import { isScenarioBatchFriendly } from "./scenarios";

export type ComboId = "all-high" | "router" | "batch";
export type ComboAvailability = "available" | "unsupported" | "not-recommended";

export interface ModelCombo {
  id: ComboId;
  name: string;
  description: string;
  availability: ComboAvailability;
  monthlyCost: number;
  savingsVsAllExpensive: { amount: number; percent: number };
  breakdown: {
    cheapModelPercent: number;
    expensiveModelPercent: number;
    batchModelPercent: number;
  };
}

export interface ComboInput {
  usage: UsageInput;
  models: ModelPrice[];
  /** User-picked anchor model id (the "all-high" baseline). */
  anchorModelId?: string | null;
  /** Share of traffic routed to the cheapest model in scheme B. 0–1. */
  cheapRatio?: number;
  /** Optional scenario id to decide whether Batch is a reasonable option. */
  scenarioId?: string | null;
}

interface CostForModel {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

function costForModel(
  model: ModelPrice,
  usage: UsageInput,
): CostForModel {
  const monthlyRequests = computeMonthlyRequests(usage);
  const avgInput = toSafeNumber(usage.avgInputTokens, 0);
  const avgOutput = toSafeNumber(usage.avgOutputTokens, 0);
  const inputCost = safeDivide(monthlyRequests * avgInput, 1_000_000, 0)
    * toSafeNumber(model.inputPer1M, 0);
  const outputCost = safeDivide(monthlyRequests * avgOutput, 1_000_000, 0)
    * toSafeNumber(model.outputPer1M, 0);
  const retryMultiplier = 1 + toSafeNumber(usage.retryRate, 0);
  const totalCost = (inputCost + outputCost) * retryMultiplier;
  return { inputCost, outputCost, totalCost };
}

function pickAnchor(
  models: ModelPrice[],
  usage: UsageInput,
  userPickedId: string | null | undefined,
): ModelPrice | null {
  if (userPickedId) {
    const picked = models.find((m) => m.model === userPickedId);
    if (picked) return picked;
  }
  // Fallback: pick the most expensive model under the current usage.
  let best: ModelPrice | null = null;
  let bestCost = -Infinity;
  for (const m of models) {
    const c = costForModel(m, usage).totalCost;
    if (c > bestCost) {
      best = m;
      bestCost = c;
    }
  }
  return best;
}

function pickCheapest(
  models: ModelPrice[],
  usage: UsageInput,
  excludeModelId?: string | null,
): ModelPrice | null {
  let best: ModelPrice | null = null;
  let bestCost = Infinity;
  for (const m of models) {
    if (excludeModelId && m.model === excludeModelId) continue;
    const c = costForModel(m, usage).totalCost;
    if (c > 0 && c < bestCost) {
      best = m;
      bestCost = c;
    }
  }
  if (best) return best;
  // Fall back to anchor itself (covers the anchor === cheapest case).
  return models.find((m) => m.model === excludeModelId) ?? null;
}

function savingsVs(anchorTotal: number, comboTotal: number) {
  const amount = Math.max(anchorTotal - comboTotal, 0);
  const percent = anchorTotal > 0 ? safeDivide(amount, anchorTotal, 0) : 0;
  return { amount, percent };
}

/**
 * 基于当前 pricing 快照和 usage，生成三个方案推荐。
 * 永远不会返回包含 NaN / Infinity 的数字；models 为空时返回空数组。
 */
export function generateCombos(input: ComboInput): ModelCombo[] {
  const { usage, models, anchorModelId, cheapRatio, scenarioId } = input;
  if (!Array.isArray(models) || models.length === 0) return [];

  const anchor = pickAnchor(models, usage, anchorModelId ?? null);
  if (!anchor) return [];

  const ratio = Math.min(Math.max(toSafeNumber(cheapRatio, 0.8), 0), 1);
  const cheapest = pickCheapest(models, usage, anchor.model);

  const anchorCost = costForModel(anchor, usage).totalCost;

  // Scheme A: all-high baseline
  const schemeA: ModelCombo = {
    id: "all-high",
    name: "All-high: single model",
    description: `Every request goes to ${anchor.displayName}.`,
    availability: "available",
    monthlyCost: anchorCost,
    savingsVsAllExpensive: savingsVs(anchorCost, anchorCost),
    breakdown: {
      cheapModelPercent: 0,
      expensiveModelPercent: 100,
      batchModelPercent: 0,
    },
  };

  // Scheme B: router
  let routerCost = anchorCost;
  if (cheapest && cheapest.model !== anchor.model) {
    const cheapCost = costForModel(cheapest, usage).totalCost;
    routerCost = ratio * cheapCost + (1 - ratio) * anchorCost;
  } else {
    // anchor === cheapest → router degenerates to anchor, no savings.
    routerCost = anchorCost;
  }
  const schemeB: ModelCombo = {
    id: "router",
    name: "Router: cheap first, high fallback",
    description: cheapest && cheapest.model !== anchor.model
      ? `${Math.round(ratio * 100)}% of traffic → ${cheapest.displayName}; the rest escalates to ${anchor.displayName}.`
      : `Anchor and cheapest resolve to the same model. Router gives no savings.`,
    availability: "available",
    monthlyCost: routerCost,
    savingsVsAllExpensive: savingsVs(anchorCost, routerCost),
    breakdown: {
      cheapModelPercent: Math.round(ratio * 100),
      expensiveModelPercent: Math.round((1 - ratio) * 100),
      batchModelPercent: 0,
    },
  };

  // Scheme C: batch
  const batchConfig = getBatchDiscount(anchor.provider);
  const batchFriendly = isScenarioBatchFriendly(scenarioId);
  const batchAvailability: ComboAvailability = !batchConfig
    ? "unsupported"
    : batchFriendly
      ? "available"
      : "not-recommended";
  let batchCost: number | null = null;
  if (batchAvailability === "available") {
    const { inputPer1M, outputPer1M } = applyBatchDiscount(
      anchor.inputPer1M,
      anchor.outputPer1M,
      anchor.provider,
    );
    const batchModel: ModelPrice = {
      ...anchor,
      inputPer1M,
      outputPer1M,
    };
    batchCost = costForModel(batchModel, usage).totalCost;
  }
  // Use 0 (not NaN) when batch should not be presented as an actionable
  // option. The UI uses availability to avoid showing misleading savings.
  const schemeCMonthly = batchCost ?? 0;
  const schemeC: ModelCombo = {
    id: "batch",
    name: "Batch: 50% off, async only",
    description: batchAvailability === "available"
      ? `${anchor.displayName} via ${anchor.provider} Batch API (50% off input & output, up to 24h latency).`
      : batchAvailability === "unsupported"
        ? `${anchor.provider} does not publish batch pricing in the current snapshot.`
        : "Batch is not recommended for the current real-time scenario",
    availability: batchAvailability,
    monthlyCost: schemeCMonthly,
    savingsVsAllExpensive: batchAvailability === "available"
      ? savingsVs(anchorCost, schemeCMonthly)
      : savingsVs(anchorCost, anchorCost),
    breakdown: {
      cheapModelPercent: 0,
      expensiveModelPercent: 0,
      batchModelPercent: batchAvailability === "available" ? 100 : 0,
    },
  };

  return [schemeA, schemeB, schemeC];
}
