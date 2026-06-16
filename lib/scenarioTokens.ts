import type {
  ChatbotParams,
  CodeAssistantParams,
  AgentParams,
  RagParams,
  ScenarioParams,
  SummarizerParams,
} from "./scenarios";
import { toSafeNumber } from "./safeNumber";

export interface ScenarioTokenEstimate {
  avgInputTokens: number;
  avgOutputTokens: number;
  note: string;
  // TODO(P0): 增加 avgCachedInputTokens 字段（如果用户启用了 cacheHitRate，
  //   cachedInputTokens = monthlyInputTokens * cacheHitRate，单独用 cached price 计算）。
}

// TODO(P0): deriveScenarioTokens() 需要接受 cacheHitRate 参数，计算：
//   freshInputTokens = avgInputTokens * (1 - cacheHitRate)
//   cachedInputTokens = avgInputTokens * cacheHitRate
//   avgCachedInputTokens 用于 computeCostReport 的分拆计算。

export function deriveScenarioTokens(
  params: ScenarioParams,
): ScenarioTokenEstimate {
  switch (params.kind) {
    case "chatbot":
      return deriveChatbotTokens(params.values);
    case "rag":
      return deriveRagTokens(params.values);
    case "agent":
      return deriveAgentTokens(params.values);
    case "code":
      return deriveCodeAssistantTokens(params.values);
    case "summarizer":
      return deriveSummarizerTokens(params.values);
  }
}

function deriveChatbotTokens(values: ChatbotParams): ScenarioTokenEstimate {
  const systemPromptTokens = tokenCount(values.systemPromptTokens);
  const userMessageTokens = tokenCount(values.userMessageTokens);
  const historyTokens = tokenCount(values.historyTokens);
  const answerTokens = tokenCount(values.answerTokens);

  return {
    avgInputTokens: systemPromptTokens + userMessageTokens + historyTokens,
    avgOutputTokens: answerTokens,
    note: "Input = system prompt + user message + recent history.",
  };
}

function deriveRagTokens(values: RagParams): ScenarioTokenEstimate {
  const systemPromptTokens = tokenCount(values.systemPromptTokens);
  const userQuestionTokens = tokenCount(values.userQuestionTokens);
  const topK = tokenCount(values.topK, { integer: true, max: 50 });
  const avgChunkTokens = tokenCount(values.avgChunkTokens);
  const answerTokens = tokenCount(values.answerTokens);

  return {
    avgInputTokens:
      systemPromptTokens + userQuestionTokens + topK * avgChunkTokens,
    avgOutputTokens: answerTokens,
    note: "Input = system prompt + user question + topK retrieved chunks.",
  };
}

function deriveAgentTokens(values: AgentParams): ScenarioTokenEstimate {
  const baseCalls = tokenCount(values.baseCalls, { integer: true, max: 100 });
  const retries = tokenCount(values.retries, { integer: true, max: 100 });
  const callsPerTask = baseCalls + retries;
  const systemPromptTokens = tokenCount(values.systemPromptTokens);
  const toolResultTokens = tokenCount(values.toolResultTokens);
  const finalAnswerTokens = tokenCount(values.finalAnswerTokens);

  return {
    avgInputTokens: callsPerTask * (systemPromptTokens + toolResultTokens),
    avgOutputTokens: callsPerTask * finalAnswerTokens,
    note: "Input/output are multiplied by base calls plus retries.",
  };
}

function deriveCodeAssistantTokens(
  values: CodeAssistantParams,
): ScenarioTokenEstimate {
  const codeContextTokens = tokenCount(values.codeContextTokens);
  const userQuestionTokens = tokenCount(values.userQuestionTokens);
  const sessionTurns = tokenCount(values.sessionTurns, {
    integer: true,
    max: 100,
  });
  const perTurnOutputTokens = tokenCount(values.perTurnOutputTokens);

  return {
    avgInputTokens: codeContextTokens + userQuestionTokens,
    avgOutputTokens: sessionTurns * perTurnOutputTokens,
    note: "Input = code context + question; output scales with session turns.",
  };
}

function deriveSummarizerTokens(
  values: SummarizerParams,
): ScenarioTokenEstimate {
  const documentTokens = tokenCount(values.documentTokens);
  const compressionRatio = toSafeNumber(values.compressionRatio, 0, {
    min: 0,
    max: 1,
  });

  return {
    avgInputTokens: documentTokens,
    avgOutputTokens: documentTokens * compressionRatio,
    note: "Output = document tokens multiplied by compression ratio.",
  };
}

function tokenCount(
  value: unknown,
  options?: { integer?: boolean; max?: number },
): number {
  return toSafeNumber(value, 0, {
    min: 0,
    max: options?.max ?? 10_000_000,
    integer: options?.integer,
  });
}
