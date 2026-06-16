/**
 * AI Cost Lens —— 模型组合推荐引擎
 *
 * P1 功能。生成三种不同的模型组合方案，供开发者在真实产品中参考。
 *
 * TODO(P1): 实现 generateCombos()，输出三个方案：
 *
 *   方案 A：全程高质量模型
 *     - 适用：正式产品、复杂问答、客服对话
 *     - 成本：高（全价）
 *     - 路由：100% 高级模型（gpt-4o / claude-3.5-sonnet）
 *
 *   方案 B：便宜模型优先 + 高级模型兜底
 *     - 适用：过滤/分类/简单问答 → 复杂问题升级到高级模型
 *     - 成本：显著降低（80% 便宜 + 20% 高级）
 *     - 路由：先用 gpt-4o-mini / claude-3.5-haiku 判断问题复杂度，
 *             简单请求直接返回，复杂请求路由到高级模型
 *     - 预估节省：取决于便宜模型处理比例，约 40-60%
 *
 *   方案 C：批处理模式
 *     - 适用：日报总结、批量分析、离线任务
 *     - 成本：比实时模式低 50%（OpenAI Batch API）
 *     - 限制：延迟更高（最长 24h），不适合实时交互
 *
 * 每个方案包含：
 *   - name / description
 *     - suitableScenarios: string[]
 *     - monthlyCost: number
 *     - savingsVsAllExpensive: { amount: number; percent: number }
 *     - caveats: string[]
 */

import type { ModelPrice } from "./pricing";

export interface ModelCombo {
  id: "all-high" | "router" | "batch";
  name: string;
  description: string;
  suitableScenarios: string[];
  monthlyCost: number;  // USD
  savingsVsAllExpensive: { amount: number; percent: number };
  caveats: string[];
  breakdown: {
    cheapModelPercent: number;
    expensiveModelPercent: number;
    batchModelPercent: number;
  };
}

/**
 * 基于当前 pricing 快照和 usage，生成三个方案推荐。
 * TODO(P1): 实现 generateCombos()
 */
export function generateCombos(
  usage: { monthlyRequests: number; avgInputTokens: number; avgOutputTokens: number },
  models: ModelPrice[],
): ModelCombo[] {
  // 占位实现，返回空数组；实现后替换此行。
  return [];
}
