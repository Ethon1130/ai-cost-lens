/**
 * AI Cost Lens —— 成本优化建议引擎
 *
 * P0 核心文件。根据用户当前的 usage、scenario、cacheHitRate、retryRate、batchMode
 * 等参数，自动生成 3-5 条针对性建议。
 *
 * 建议按优先级排序：
 *   1. 影响最大的（output token 占比、batch 适用性）
 *   2. 容易实施的（cache、可选模型）
 *   3. 架构级的（路由策略、模型组合）
 *
 * 每条建议包含：
 *   - title（中文 / 英文）
 *   - description（解释为什么）
 *   - priority：'high' | 'medium' | 'low'
 *   - savingsEstimate（如果有估算，显示节省 % 或绝对金额）
 *
 * TODO(P0): 实现 generateRecommendations()：
 *   1. 如果 outputCost / totalCost > 0.6 → 建议限制 max_tokens 或使用更短回复模型
 *   2. 如果 scenario === 'chatbot' && cacheHitRate === 0 → 建议开启 prompt caching（system prompt 重复率高时效果最好）
 *   3. 如果 scenario === 'rag' && topK > 5 → 建议减少 topK 或压缩 chunk 大小
 *   4. 如果任务类型适合批处理（日报/总结/离线分析）且 batchMode === false → 建议开启 Batch API
 *   5. 如果 retryRate > 0 → 建议添加 retry budget 说明，并考虑用更稳定的模型降低 retry 率
 *
 * TODO(P0): 实现 computeSavingsEstimate()：
 *   给出每条建议对应的预估节省金额或比例。
 *
 * TODO(P1): 增加「模型组合路由」建议：
 *   如果 currentScenario 是简单问答/客服类，生成「便宜模型初筛 + 高级模型兜底」建议。
 *
 * TODO(P2): 支持根据用户实际请求频率生成「峰值 vs 非峰值」建议。
 */

export interface Recommendation {
  id: string;
  title: string;       // e.g. "输出 token 占比过高，建议限制 max_tokens"
  description: string;  // e.g. "输出 token 占总成本 72%。限制 max_tokens 或使用更擅长短回复的模型，可显著降低成本。"
  priority: "high" | "medium" | "low";
  savingsEstimate?: string;  // e.g. "预计节省 ~15-30%"
}

export interface RecommendationsInput {
  /** 当前场景 kind */
  scenarioKind: string;
  /** output cost 占总成本的比例，0-1 */
  outputCostRatio: number;
  /** 当前是否启用了 prompt caching */
  cacheHitRate: number;
  /** 当前是否启用了 batch mode */
  batchMode: boolean;
  /** 重试率 0-1 */
  retryRate: number;
  /** topK（仅 RAG 场景）*/
  topK?: number;
  /** 是否有实时返回需求（影响 batch 建议）*/
  realtimeRequired: boolean;
  /** 当前最便宜模型的月成本（用于计算节省估算）*/
  cheapestMonthlyCost: number;
  /** 最贵模型的月成本（用于计算切换节省）*/
  expensiveMonthlyCost: number;
}

/**
 * 根据输入参数生成优化建议列表。
 * 所有建议都基于估算，实际节省取决于真实产品行为。
 */
export function generateRecommendations(input: RecommendationsInput): Recommendation[] {
  // TODO(P0): 实现建议生成逻辑（见文件头部的 TODO 详情）
  // 占位实现，返回空数组；实现后替换此行。
  return [];
}

/**
 * 估算某条建议对应的月成本节省（USD）。
 * 如果无法估算，返回 null。
 */
export function estimateSavingsForRecommendation(
  recId: string,
  input: RecommendationsInput,
): number | null {
  // TODO(P0): 实现各条建议的节省估算
  // - 限制 max_tokens：假设 output 减少 20-40%
  // - prompt caching：假设重复 system prompt 部分 100% 命中，节省该部分 input 成本
  // - 减少 topK：topK 每降低 1，input tokens 减少 avgChunkTokens
  // - Batch mode：OpenAI 50% 折扣，Anthropic 类似
  return null;
}
