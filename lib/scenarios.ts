import type { UsageInput } from "./calculate";

/**
 * Pre-built usage presets aimed at indie devs / programmers evaluating an AI
 * project. Each preset is intentionally opinionated; users can tweak afterwards.
 */
export interface ScenarioPreset {
  id: string;
  title: string;
  description: string;
  usage: UsageInput;
}

export const SCENARIOS: ScenarioPreset[] = [
  {
    id: "ai-chatbot-mvp",
    title: "AI Chatbot MVP",
    description:
      "A small chat product with short system prompts and brief replies.",
    usage: {
      dailyUsers: 200,
      requestsPerUserPerDay: 4,
      avgInputTokens: 200,
      avgOutputTokens: 300,
    },
  },
  {
    id: "rag-knowledge-base",
    title: "RAG Knowledge Base",
    description:
      "Retrieval-augmented Q&A with medium-length context chunks injected per query.",
    usage: {
      dailyUsers: 300,
      requestsPerUserPerDay: 3,
      avgInputTokens: 1500,
      avgOutputTokens: 400,
    },
  },
  {
    id: "code-assistant",
    title: "Code Assistant",
    description:
      "Long file context plus medium-length code suggestions.",
    usage: {
      dailyUsers: 150,
      requestsPerUserPerDay: 5,
      avgInputTokens: 2000,
      avgOutputTokens: 800,
    },
  },
  {
    id: "ai-agent-workflow",
    title: "AI Agent Workflow",
    description:
      "Multi-step agent loop with planning, tool calls and final answers per user turn.",
    usage: {
      dailyUsers: 100,
      requestsPerUserPerDay: 6,
      avgInputTokens: 800,
      avgOutputTokens: 500,
    },
  },
  {
    id: "document-summarizer",
    title: "Document Summarizer",
    description:
      "Users paste long documents and the model returns a concise summary.",
    usage: {
      dailyUsers: 250,
      requestsPerUserPerDay: 2,
      avgInputTokens: 4000,
      avgOutputTokens: 300,
    },
  },
];

export function getScenarioById(id: string): ScenarioPreset | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
