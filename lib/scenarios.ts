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
      activeUsers: 200,
      avgInputTokens: 380,
      avgOutputTokens: 300,
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
    },
  },
];

export function getScenarioById(id: string): ScenarioPreset | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
