/**
 * AI Cost Lens —— 批处理（Batch）折扣引擎
 *
 * P1 功能。根据官方文档：
 * - OpenAI Batch API：50% 折扣（相比同步 API）
 * - Anthropic Message Batches：类似折扣结构
 *
 * 本文件仅处理 cache read 简化场景。
 * 不包含 cache write、TTL、batch 队列管理等复杂维度。
 *
 * TODO(P1): 实现 applyBatchDiscount()：
 *   输入原始 input/output 价格，返回 batch 模式下的折扣价格。
 *
 * TODO(P1): 实现 computeBatchCost()：
 *   在 batch 模式下计算 inputCost / outputCost / totalCost。
 *
 * TODO(P1): 实现 isScenarioSuitableForBatch()：
 *   判断当前场景是否适合 batch mode。
 *   适合：日报总结、批量翻译、离线分析、报告生成。
 *   不适合：实时对话、客服、交互式代码助手。
 */

export interface BatchDiscountConfig {
  /** batch input 折扣比例（相对同步 input） */
  inputDiscount: number;
  /** batch output 折扣比例（相对同步 output） */
  outputDiscount: number;
  /** batch 模式最大延迟说明 */
  maxLatencyNote: string;
}

/** OpenAI Batch API 官方折扣：input/output 均 50% off */
export const OPENAI_BATCH_DISCOUNT: BatchDiscountConfig = {
  inputDiscount: 0.5,
  outputDiscount: 0.5,
  maxLatencyNote: "Up to 24 hours for completion",
};

/** Anthropic Message Batches 官方折扣（参考 Anthropic 文档） */
export const ANTHROPIC_BATCH_DISCOUNT: BatchDiscountConfig = {
  inputDiscount: 0.5,
  outputDiscount: 0.5,
  maxLatencyNote: "Asynchronous, up to 24 hours",
};

/** 判断 provider 是否支持 batch */
export function getBatchDiscount(provider: string): BatchDiscountConfig | null {
  // TODO(P1): 扩展支持更多 provider 的 batch 折扣
  switch (provider) {
    case "OpenAI":
      return OPENAI_BATCH_DISCOUNT;
    case "Anthropic":
      return ANTHROPIC_BATCH_DISCOUNT;
    default:
      return null;
  }
}

/**
 * 将同步价格转为 batch 价格。
 * TODO(P1): 实现 applyBatchDiscount()
 */
export function applyBatchDiscount(
  inputPer1M: number,
  outputPer1M: number,
  provider: string,
): { inputPer1M: number; outputPer1M: number } {
  const discount = getBatchDiscount(provider);
  if (!discount) return { inputPer1M, outputPer1M };
  return {
    inputPer1M: inputPer1M * discount.inputDiscount,
    outputPer1M: outputPer1M * discount.outputDiscount,
  };
}

/**
 * 判断场景是否适合 batch 模式。
 * TODO(P1): 实现 isScenarioSuitableForBatch()
 */
export function isScenarioSuitableForBatch(scenarioKind: string): boolean {
  // 适合 batch：summarizer、batch-translate、离线分析
  // 不适合：chatbot、agent、code（需要实时返回）
  const batchFriendly = ["summarizer", "batch-translate", "offline-analysis"];
  return batchFriendly.includes(scenarioKind);
}
