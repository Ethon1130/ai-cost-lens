import type { UsageInput } from "./calculate";

export type ScenarioKind =
  | "chatbot"
  | "rag"
  | "agent"
  | "code"
  | "summarizer";

export interface ChatbotParams {
  systemPromptTokens: number;
  userMessageTokens: number;
  historyTokens: number;
  answerTokens: number;
}

export interface RagParams {
  systemPromptTokens: number;
  userQuestionTokens: number;
  topK: number;
  avgChunkTokens: number;
  answerTokens: number;
}

export interface AgentParams {
  baseCalls: number;
  retries: number;
  systemPromptTokens: number;
  toolResultTokens: number;
  finalAnswerTokens: number;
}

export interface CodeAssistantParams {
  codeContextTokens: number;
  userQuestionTokens: number;
  sessionTurns: number;
  perTurnOutputTokens: number;
}

export interface SummarizerParams {
  documentTokens: number;
  compressionRatio: number;
}

export type ScenarioParams =
  | { kind: "chatbot"; values: ChatbotParams }
  | { kind: "rag"; values: RagParams }
  | { kind: "agent"; values: AgentParams }
  | { kind: "code"; values: CodeAssistantParams }
  | { kind: "summarizer"; values: SummarizerParams };

/**
 * Pre-built usage presets aimed at indie devs / programmers evaluating an AI
 * project. Each preset is intentionally opinionated; users can tweak afterwards.
 */
// TODO(P0): 新增场景 preset「批量翻译」：适合 batch 模式，输入长文档 + 输出短摘要，batch mode 下成本可降 50%。
// TODO(P0): 新增场景 preset「图片生成」：对应 Replicate / fal.ai 非 token 计费模型，计费单位是「张/次」，
//   不走 token 计费逻辑，需在 pricing.ts 新增 RuntimeBillingModel 接口。
// TODO(P0): 新增两个场景 preset：「批量翻译 / 视频生成」，对应 batch 场景 + 多模态计费。
//   批量翻译适合 batch mode，视频生成对应 Replicate/fal.ai 非 token 计费模型。
export interface ScenarioPreset {
  id: string;
  title: string;
  description: string;
  params: ScenarioParams;
  usage: UsageInput;
}

export const SCENARIOS: ScenarioPreset[] = [
  {
    id: "ai-chatbot-mvp",
    title: "AI Chatbot MVP",
    description:
      "A small chat product with short system prompts and brief replies.",
    params: {
      kind: "chatbot",
      values: {
        systemPromptTokens: 120,
        userMessageTokens: 80,
        historyTokens: 180,
        answerTokens: 300,
      },
    },
    usage: {
      requestsPerDay: 800,
      daysPerMonth: 30,
      activeUsers: 0,
      avgInputTokens: 380,
      avgOutputTokens: 300,
      retryRate: 0,
    },
  },
  {
    id: "rag-knowledge-base",
    title: "RAG Knowledge Base",
    description:
      "Retrieval-augmented Q&A with medium-length context chunks injected per query.",
    params: {
      kind: "rag",
      values: {
        systemPromptTokens: 180,
        userQuestionTokens: 120,
        topK: 4,
        avgChunkTokens: 300,
        answerTokens: 400,
      },
    },
    usage: {
      requestsPerDay: 900,
      daysPerMonth: 30,
      activeUsers: 300,
      avgInputTokens: 1500,
      avgOutputTokens: 400,
      retryRate: 0,
    },
  },
  {
    id: "code-assistant",
    title: "Code Assistant",
    description:
      "Long file context plus medium-length code suggestions.",
    params: {
      kind: "code",
      values: {
        codeContextTokens: 1800,
        userQuestionTokens: 200,
        sessionTurns: 1,
        perTurnOutputTokens: 800,
      },
    },
    usage: {
      requestsPerDay: 750,
      daysPerMonth: 30,
      activeUsers: 150,
      avgInputTokens: 2000,
      avgOutputTokens: 800,
      retryRate: 0,
    },
  },
  {
    id: "ai-agent-workflow",
    title: "AI Agent Workflow",
    description:
      "Multi-step agent loop with planning, tool calls and final answers per user turn.",
    params: {
      kind: "agent",
      values: {
        baseCalls: 3,
        retries: 1,
        systemPromptTokens: 250,
        toolResultTokens: 550,
        finalAnswerTokens: 500,
      },
    },
    usage: {
      requestsPerDay: 600,
      daysPerMonth: 30,
      activeUsers: 100,
      avgInputTokens: 3200,
      avgOutputTokens: 2000,
      retryRate: 0.1,
    },
  },
  {
    id: "document-summarizer",
    title: "Document Summarizer",
    description:
      "Users paste long documents and the model returns a concise summary.",
    params: {
      kind: "summarizer",
      values: {
        documentTokens: 4000,
        compressionRatio: 0.075,
      },
    },
    usage: {
      requestsPerDay: 500,
      daysPerMonth: 30,
      activeUsers: 250,
      avgInputTokens: 4000,
      avgOutputTokens: 300,
      retryRate: 0,
    },
  },
];

// =============================================================================
// Quick Estimation Mode Types (new)
// 场景专属的「长度档位」描述 + token 映射，适合不懂 token 的普通开发者
// =============================================================================

export interface QuickLengthOption {
  /** 用户看到的显示文案，如「简单对话」「深度研究」 */
  label: string;
  /** 映射到具体 input token 数（outputLengthOptions 中不需要） */
  inputTokens?: number;
  /** 映射到具体 output token 数 */
  outputTokens: number;
}

export interface QuickScenario {
  id: string;
  /** 用户看到的场景名 */
  title: string;
  /** 场景描述 */
  description: string;
  /** Input 长度档位选项 */
  inputLengthOptions: QuickLengthOption[];
  /** Output 长度档位选项 */
  outputLengthOptions: QuickLengthOption[];
  /** 默认选中的 input 档位 index */
  defaultInputIndex: number;
  /** 默认选中的 output 档位 index */
  defaultOutputIndex: number;
}

/**
 * 快速估算模式的场景配置
 * 各场景的档位设计采用场景专属描述，而非统一「短/中/长」
 */
export const QUICK_SCENARIOS: QuickScenario[] = [
  {
    id: "ai-chatbot",
    title: "AI Chatbot",
    description: "Simple conversational scenarios like customer service bots, FAQ assistants.",
    inputLengthOptions: [
      { label: "Simple chat", inputTokens: 200, outputTokens: 100 },
      { label: "Normal chat", inputTokens: 500, outputTokens: 200 },
      { label: "Complex multi-turn", inputTokens: 1200, outputTokens: 400 },
    ],
    outputLengthOptions: [
      { label: "Short reply", outputTokens: 100 },
      { label: "Medium reply", outputTokens: 250 },
      { label: "Detailed reply", outputTokens: 500 },
    ],
    defaultInputIndex: 1,
    defaultOutputIndex: 1,
  },
  {
    id: "rag-qa",
    title: "RAG Q&A",
    description: "Retrieval-augmented Q&A for knowledge base scenarios.",
    inputLengthOptions: [
      { label: "Simple query", inputTokens: 500, outputTokens: 150 },
      { label: "Complex query", inputTokens: 1500, outputTokens: 350 },
      { label: "Deep research", inputTokens: 3000, outputTokens: 600 },
    ],
    outputLengthOptions: [
      { label: "Brief answer", outputTokens: 150 },
      { label: "Detailed explanation", outputTokens: 400 },
      { label: "Comprehensive analysis", outputTokens: 800 },
    ],
    defaultInputIndex: 1,
    defaultOutputIndex: 1,
  },
  {
    id: "code-assistant",
    title: "Code Assistant",
    description: "Code analysis and generation assistance tools.",
    inputLengthOptions: [
      { label: "Single file", inputTokens: 800, outputTokens: 200 },
      { label: "Multi-file", inputTokens: 2500, outputTokens: 500 },
      { label: "Full codebase", inputTokens: 5000, outputTokens: 1000 },
    ],
    outputLengthOptions: [
      { label: "Code snippet", outputTokens: 200 },
      { label: "Complete function", outputTokens: 500 },
      { label: "Project-level changes", outputTokens: 1200 },
    ],
    defaultInputIndex: 1,
    defaultOutputIndex: 1,
  },
  {
    id: "summarizer",
    title: "Summarizer",
    description: "Document summarization and content condensing.",
    inputLengthOptions: [
      { label: "Short doc (~1 page)", inputTokens: 1000, outputTokens: 150 },
      { label: "Long doc (~5 pages)", inputTokens: 4000, outputTokens: 400 },
      { label: "Very long doc (~20 pages)", inputTokens: 10000, outputTokens: 800 },
    ],
    outputLengthOptions: [
      { label: "Key points", outputTokens: 150 },
      { label: "Summary", outputTokens: 400 },
      { label: "Detailed summary", outputTokens: 800 },
    ],
    defaultInputIndex: 1,
    defaultOutputIndex: 1,
  },
];

export function getQuickScenarioById(id: string): QuickScenario | undefined {
  return QUICK_SCENARIOS.find((s) => s.id === id);
}

export function getQuickScenarioTokens(
  scenario: QuickScenario,
  inputIndex: number,
  outputIndex: number,
): { avgInputTokens: number; avgOutputTokens: number } {
  const inputOption = scenario.inputLengthOptions[inputIndex] ?? scenario.inputLengthOptions[0];
  const outputOption = scenario.outputLengthOptions[outputIndex] ?? scenario.outputLengthOptions[0];
  return {
    avgInputTokens: inputOption?.inputTokens ?? 0,
    avgOutputTokens: outputOption?.outputTokens ?? 0,
  };
}

export function getScenarioById(id: string): ScenarioPreset | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
