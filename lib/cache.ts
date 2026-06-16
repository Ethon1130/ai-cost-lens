/**
 * AI Cost Lens —— Prompt Caching 成本计算引擎
 *
 * P0 核心功能之一。根据官方文档：
 * - OpenAI：cached input price ≈ 10% of regular input price
 * - Anthropic：cache read 有单独定价
 *
 * 本文件仅处理 cache read 简化场景（不含 cache write、TTL、cache creation cost）。
 *
 * TODO(P0): 实现 computeCachedCost():
 *   inputCost = freshInputCost + cachedInputCost
 *   freshInputTokens = monthlyInputTokens * (1 - cacheHitRate)
 *   cachedInputTokens = monthlyInputTokens * cacheHitRate
 *   freshInputCost = (freshInputTokens / 1M) * inputPer1M
 *   cachedInputCost = (cachedInputTokens / 1M) * cachedInputPer1M
 *
 * TODO(P0): 实现 getCachedInputPrice()：
 *   根据 provider 获取 cached input 价格（有的 provider 没有单独的 cached price）。
 *
 * TODO(P0): 实现 getScenarioCachePotential()：
 *   评估当前场景的缓存潜力（0-100%），给出建议 cacheHitRate。
 *   高潜力：chatbot（固定 system prompt）、agent（工具定义重复）
 *   中潜力：RAG（检索片段可能重复）
 *   低潜力：summarizer（每次文档不同）、code（代码上下文几乎不重复）
 */

import type { ModelPrice } from "./pricing";

export interface CacheCostResult {
  freshInputTokens: number;
  cachedInputTokens: number;
  freshInputCost: number;
  cachedInputCost: number;
  totalInputCost: number;
  /** 节省的 input 成本（USD） */
  inputSavings: number;
  /** 节省比例 0-1 */
  inputSavingsRatio: number;
}

/**
 * 估算缓存命中率对成本的影响。
 * @param monthlyInputTokens - 月度总 input tokens
 * @param cacheHitRate - 缓存命中率，0-1
 * @param inputPer1M - 普通 input 价格（$/1M）
 * @param cachedInputPer1M - cached input 价格（$/1M）
 */
export function computeCachedCost(
  monthlyInputTokens: number,
  cacheHitRate: number,
  inputPer1M: number,
  cachedInputPer1M: number,
): CacheCostResult {
  // TODO(P0): 实现上述逻辑
  const safeRate = Math.min(Math.max(cacheHitRate, 0), 1);
  const freshInputTokens = monthlyInputTokens * (1 - safeRate);
  const cachedInputTokens = monthlyInputTokens * safeRate;
  const freshInputCost = (freshInputTokens / 1_000_000) * inputPer1M;
  const cachedInputCost = (cachedInputTokens / 1_000_000) * cachedInputPer1M;
  const totalInputCost = freshInputCost + cachedInputCost;
  const noCacheCost = (monthlyInputTokens / 1_000_000) * inputPer1M;
  const inputSavings = Math.max(noCacheCost - totalInputCost, 0);
  const inputSavingsRatio = noCacheCost > 0 ? inputSavings / noCacheCost : 0;
  return {
    freshInputTokens,
    cachedInputTokens,
    freshInputCost,
    cachedInputCost,
    totalInputCost,
    inputSavings,
    inputSavingsRatio,
  };
}

/**
 * 获取模型对应的 cached input 价格。
 * 如果 provider 不支持 cached input，返回原始 input 价格。
 * TODO(P0): 根据官方文档补充各 provider 的 cached input 价格
 */
export function getCachedInputPrice(model: ModelPrice): number {
  // 所有 token 计费模型都支持 cached input（但价格因 provider 而异）
  const inputPer1M = model.inputPer1M ?? 0;

  // 如果模型已经有 cachedInputPer1M，直接使用（来自 API 数据）
  if (model.cachedInputPer1M !== undefined) {
    return model.cachedInputPer1M;
  }

  // 否则根据 provider 估算
  // OpenAI: cached input ≈ 10% of regular input
  if (model.provider === "OpenAI") {
    return inputPer1M * 0.1;
  }

  // Anthropic: cache read 有单独定价（暂无公开数据，返回 0）
  if (model.provider === "Anthropic") {
    return 0;
  }

  // Google Gemini: cached input 有折扣
  if (model.provider === "Google") {
    return inputPer1M * 0.5;
  }

  // DeepSeek, Moonshot (Kimi): 支持 cache
  if (model.provider === "DeepSeek" || model.provider === "Moonshot") {
    return inputPer1M * 0.2;
  }

  // 其他 provider 暂不支持或无数据
  return 0;
}

/**
 * 评估场景的缓存潜力（0-100%）。
 * TODO(P0): 实现 getScenarioCachePotential()
 */
export function getScenarioCachePotential(
  scenarioKind: string,
): { potential: number; suggestedHitRate: number; reason: string } {
  // 占位实现；替换时补充真实评估逻辑
  switch (scenarioKind) {
    case "chatbot":
      return {
        potential: 0.7,
        suggestedHitRate: 0.6,
        reason: "固定 system prompt 在每次请求中重复，缓存潜力高",
      };
    case "agent":
      return {
        potential: 0.8,
        suggestedHitRate: 0.7,
        reason: "工具定义和 agent 指令高度重复，缓存效果显著",
      };
    case "rag":
      return {
        potential: 0.4,
        suggestedHitRate: 0.3,
        reason: "检索片段可能部分重复，实际命中率取决于知识库更新频率",
      };
    case "code":
      return {
        potential: 0.2,
        suggestedHitRate: 0.1,
        reason: "代码上下文通常不重复，缓存收益有限",
      };
    case "summarizer":
    default:
      return {
        potential: 0.1,
        suggestedHitRate: 0.0,
        reason: "每次输入文档不同，缓存效果几乎为零",
      };
  }
}
