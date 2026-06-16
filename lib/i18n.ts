import type { ScenarioKind } from "./scenarios";

export type Language = "en" | "zh";
export type ThemeMode = "light" | "dark";

export interface AppCopy {
  controls: {
    languageLabel: string;
    themeLabel: string;
    currencyLabel: string;
    english: string;
    chinese: string;
    light: string;
    dark: string;
    currencyUsd: string;
    currencyCny: string;
    rateDemo: string;
    rateLive: string;
    fxLive: string;
    fxFallback: string;
  };
  modelFilter: {
    searchPlaceholder: string;
    allProviders: string;
    provider: string;
    filterByProvider: string;
    selectAll: string;
    clear: string;
    models: string;
    emptyResults: string;
  };
  hero: {
    badge: string;
    title: string;
    description: string;
    footer: string;
  };
  scenarios: {
    heading: string;
    description: string;
    active: string;
    items: Record<string, { title: string; description: string }>;
  };
  scenarioParams: {
    heading: string;
    description: string;
    avgInput: string;
    avgOutput: string;
    fields: Record<string, { label: string; hint: string }>;
    notes: Record<ScenarioKind, string>;
  };
  tokenEstimator: {
    placeholder: string;
    tokenizerLabel: string;
    tokensLabel: string;
    approximateNotice: string;
    applyButton: string;
    cancelButton: string;
    hint: string;
    tokenizerName: string;
    charsLabel: string;
    applyAriaLabel: string;
  };
  mode: {
    heading: string;
    description: string;
    trafficMode: string;
    trafficDescription: string;
    budgetMode: string;
    budgetDescription: string;
  };
  usage: {
    heading: string;
    description: string;
    requestsPerDay: string;
    requestsPerDayHint: string;
    daysPerMonth: string;
    daysPerMonthHint: string;
    activeUsers: string;
    activeUsersHint: string;
    retryRate: string;
    retryRateHint: string;
  };
  summary: {
    heading: string;
    description: string;
    cheapest: string;
    cheapestTitle: string;
    monthlyCost: string;
    costPerRequest: string;
    costPer1KRequests: string;
    costPerUserPerMonth: string;
    monthlyRequests: string;
    inputTokensPerMonth: string;
    outputTokensPerMonth: string;
    estimateNote: string;
    noTraffic: string;
    inView: string;
  };
  budget: {
    heading: string;
    description: string;
    monthlyBudget: string;
    monthlyBudgetHint: string;
    bestValue: string;
    bestValueTitle: string;
    maxRequests: string;
    costPerRequest: string;
    costPer1KRequests: string;
    avgInputTokens: string;
    avgOutputTokens: string;
    budgetLabel: string;
    ranking: string;
    note: string;
    noBudget: string;
    emptyRanking: string;
  };
  savings: {
    heading: string;
    description: string;
    cheapest: string;
    comparedWith: string;
    monthlySavings: string;
    percentSavings: string;
    comparison: string;
    noPaidTraffic: string;
    noEstimatedSavings: string;
    result: string;
    caveat: string;
    to: string;
  };
  table: {
    heading: string;
    select: string;
    selectForComparison: string;
    description: string;
    model: string;
    provider: string;
    input: string;
    output: string;
    totalPerMonth: string;
    perRequest: string;
    per1KRequests: string;
    perUserPerMonth: string;
    cheapest: string;
  };
  comparison: {
    heading: string;
    description: string;
    metric: string;
    inputCost: string;
    outputCost: string;
    totalCost: string;
    costPerRequest: string;
    costPer1KRequests: string;
    costPerUserPerMonth: string;
    switchingTo: string;
    saves: string;
    perMonth: string;
    clear: string;
  };
  sources: {
    heading: string;
    description: string;
    input: string;
    output: string;
    checked: string;
    liveBadge: string;
    localBadge: string;
    updatedLabel: string;
    cachedBadge: string;
    cachedTitle: string;
    emptyState: string;
  };
  limitations: {
    heading: string;
    items: string[];
  };
  combo: {
    heading: string;
    description: string;
    anchorLabel: string;
    anchorHint: string;
    routerRatioLabel: string;
    routerRatioHint: string;
    cheapShare: string;
    highShare: string;
    monthlyCost: string;
    savings: string;
    savingsNone: string;
    notEnoughModels: string;
    caveatsHeading: string;
    latencyNote: string;
    batchLatencyValue: string;
    batchShare: string;
    batchUnavailableCost: string;
    batchSavingsUnavailable: string;
    schemeA: { name: string; tagline: string; tags: string[]; caveats: string[] };
    schemeB: { name: string; tagline: string; tags: string[]; caveats: string[] };
    schemeC: {
      name: string;
      tagline: string;
      unsupported: string;
      notRecommended: string;
      tags: string[];
      caveats: string[];
      unsupportedCaveats: string[];
      notRecommendedCaveats: string[];
    };
  };
  quickEstimate: {
    heading: string;
    description: string;
    scenarioLabel: string;
    apiCallsPerDayLabel: string;
    apiCallsPerDayHint: string;
    daysPerMonthLabel: string;
    daysPerMonthHint: string;
    productLensToggle: string;
    activeUsersLabel: string;
    activeUsersHint: string;
    inputComplexityLabel: string;
    outputLengthLabel: string;
    resultHeading: string;
    cheapestModel: string;
    recommendation: string;
    recommendationLine: string;
    monthlyRequests: string;
    noTraffic: string;
    best: string;
    noModelsMatch: string;
    placeholder: {
      apiCallsPerDay: string;
      daysPerMonth: string;
      activeUsers: string;
    };
  };
  primaryMode: {
    quick: string;
    quickDescription: string;
    advanced: string;
    advancedDescription: string;
  };
  share: {
    buttonLabel: string;
    copied: string;
    copyFailed: string;
  };
  quickScenarios: Record<string, {
    title: string;
    description: string;
    inputLabels: string[];
    outputLabels: string[];
  }>;
}

export const COPY: Record<Language, AppCopy> = {
  en: {
    controls: {
      languageLabel: "Language",
      themeLabel: "Display",
      currencyLabel: "Currency",
      english: "Switch to English",
      chinese: "Switch to Chinese",
      light: "Switch to day mode",
      dark: "Switch to night mode",
      currencyUsd: "Switch to USD",
      currencyCny: "Switch to CNY",
      rateDemo: "Demo rate: 1 USD ≈ 7.25 CNY",
      rateLive: "Live rate: 1 USD ≈ {rate} CNY",
      fxLive: "live",
      fxFallback: "fallback",
    },
    modelFilter: {
      searchPlaceholder: "Search models",
      allProviders: "All Providers",
      provider: "Provider",
      filterByProvider: "Filter by Provider",
      selectAll: "All",
      clear: "Clear",
      models: "models",
      emptyResults: "No models match your filter criteria.",
    },
    hero: {
      badge: "AI Cost Lens",
      title: "AI API cost simulator for early-stage products",
      description:
        "Pick a product scenario, tune the token assumptions behind it, and compare monthly cost across OpenAI (GPT), Anthropic (Claude), and Google (Gemini) pricing, Data is fetched live from the llm-prices open-source project, No account, no API key needed",
      footer:
        "Built for indie devs evaluating an AI project, Data is sourced from simonw/llm-prices; verify the latest price on each provider's official page before making a decision",
    },
    scenarios: {
      heading: "Pick a scenario",
      description:
        "Starting presets for common AI project shapes, Tweak the numbers in step 2 afterwards",
      active: "Active",
      items: {
        "ai-chatbot-mvp": {
          title: "AI Chatbot MVP",
          description:
            "A small chat product with short system prompts and brief replies",
        },
        "rag-knowledge-base": {
          title: "RAG Knowledge Base",
          description:
            "Retrieval-augmented Q&A with medium-length context chunks injected per query",
        },
        "code-assistant": {
          title: "Code Assistant",
          description: "Long file context plus medium-length code suggestions",
        },
        "ai-agent-workflow": {
          title: "AI Agent Workflow",
          description:
            "Multi-step agent loop with planning, tool calls and final answers per user turn",
        },
        "document-summarizer": {
          title: "Document Summarizer",
          description:
            "Users paste long documents and the model returns a concise summary",
        },
      },
    },
    scenarioParams: {
      heading: "Tune scenario assumptions",
      description:
        "These fields drive the average input and output tokens for the active scenario, Hidden fields from other scenarios are reset when you switch",
      avgInput: "Avg input / request",
      avgOutput: "Avg output / request",
      fields: {
        systemPromptTokens: {
          label: "System prompt tokens",
          hint: "Persona, guardrails, and product instructions",
        },
        userMessageTokens: {
          label: "User message tokens",
          hint: "Average user message length",
        },
        historyTokens: {
          label: "Recent history tokens",
          hint: "Conversation context carried into each request",
        },
        answerTokens: {
          label: "Answer tokens",
          hint: "Average model response length",
        },
        userQuestionTokens: {
          label: "User question tokens",
          hint: "Average question length",
        },
        topK: {
          label: "Retrieved chunks",
          hint: "How many chunks are injected per request",
        },
        avgChunkTokens: {
          label: "Avg chunk tokens",
          hint: "Average token length per retrieved chunk",
        },
        baseCalls: {
          label: "Base calls / task",
          hint: "Planned model calls before retries",
        },
        retries: {
          label: "Retries / task",
          hint: "Average extra calls from retries or revisions",
        },
        toolResultTokens: {
          label: "Tool result tokens",
          hint: "Average tool output returned to the model",
        },
        finalAnswerTokens: {
          label: "Answer tokens / call",
          hint: "Average output per model call",
        },
        codeContextTokens: {
          label: "Code context tokens",
          hint: "Files, snippets, and diagnostics in context",
        },
        sessionTurns: {
          label: "Session turns",
          hint: "How many output turns a request usually creates",
        },
        perTurnOutputTokens: {
          label: "Output tokens / turn",
          hint: "Average code or explanation generated per turn",
        },
        documentTokens: {
          label: "Document tokens",
          hint: "Average input document length",
        },
        compressionRatio: {
          label: "Compression ratio",
          hint: "0.075 means output is about 7.5% of the document",
        },
      },
      notes: {
        chatbot: "Input = system prompt + user message + recent history",
        rag: "Input = system prompt + user question + topK retrieved chunks",
        agent: "Input/output are multiplied by base calls plus retries",
        code: "Input = code context + question; output scales with session turns",
        summarizer: "Output = document tokens multiplied by compression ratio",
      },
    },
    tokenEstimator: {
      placeholder:
        "Paste a real user message, code snippet, document, or tool result",
      tokenizerLabel: "Estimated tokens",
      tokensLabel: "tokens",
      approximateNotice:
        "Approximate estimate (tokenizer unavailable, using chars / 4)",
      applyButton: "Apply",
      cancelButton: "Cancel",
      hint: "Will set {field} (current: {current})",
      tokenizerName: "GPT-4 tokenizer",
      charsLabel: "chars",
      applyAriaLabel: "Estimate tokens for {field}",
    },
    mode: {
      heading: "Choose calculation mode",
      description:
        "Estimate expected traffic cost, or reverse the question from a fixed monthly budget",
      trafficMode: "Traffic Mode",
      trafficDescription: "How much will my expected usage cost?",
      budgetMode: "Budget Setup",
      budgetDescription: "How many requests can my budget support?",
    },
    usage: {
      heading: "Estimate API usage",
      description:
        "Estimate direct API call volume first, Active users are optional and only affect the per-user product lens",
      requestsPerDay: "API requests / day",
      requestsPerDayHint:
        "How many model API calls you expect on an average day",
      daysPerMonth: "Billable days / month",
      daysPerMonthHint:
        "Use 30 for a normal month, or a smaller number for experiments",
      activeUsers: "Active users (optional)",
      activeUsersHint:
        "Only used for cost per active user; it does not change tokens or monthly cost",
      retryRate: "Retry rate",
      retryRateHint:
        "Share of failed requests that are retried (0 = none, 0.1 = 10%), Retries multiply total cost",
    },
    summary: {
      heading: "Unit economics summary",
      description:
        "Summary uses the cheapest model in the current pricing snapshot, The full per-model breakdown follows below",
      cheapest: "Cheapest",
      cheapestTitle: "Lowest monthly total cost across the snapshot models",
      monthlyCost: "Monthly cost",
      costPerRequest: "Cost / request",
      costPer1KRequests: "Cost / 1K requests",
      costPerUserPerMonth: "Cost / user / mo",
      monthlyRequests: "Monthly requests",
      inputTokensPerMonth: "Input tokens / mo",
      outputTokensPerMonth: "Output tokens / mo",
      estimateNote:
        "Costs are estimates based on the snapshot prices below, They do not include free tiers, taxes, enterprise discounts, or rate limits",
      noTraffic: "Enter some traffic in step 3 to see real numbers",
      inView: "in current filter",
    },
    budget: {
      heading: "Budget mode",
      description:
        "Estimate how many requests each model can support under a fixed monthly AI budget",
      monthlyBudget: "Monthly budget (USD)",
      monthlyBudgetHint:
        "Your hard monthly AI budget, The ranking reuses the current scenario token assumptions",
      bestValue: "Most runway",
      bestValueTitle: "The model that supports the most requests under this budget",
      maxRequests: "Max requests",
      costPerRequest: "Cost / request",
      costPer1KRequests: "Cost / 1K requests",
      avgInputTokens: "Input / request",
      avgOutputTokens: "Output / request",
      budgetLabel: "Budget",
      ranking: "Budget runway ranking",
      note:
        "This uses the current scenario token assumptions and official pricing snapshot, It is an estimate, not a billing guarantee",
      noBudget:
        "Enter a monthly budget above $0 and keep token assumptions above 0 to see runway estimates",
      emptyRanking: "No models match your filter criteria.",
    },
    savings: {
      heading: "Estimated savings vs baseline",
      description:
        "Pick a baseline model and estimate how much the cheapest option in this snapshot may save for the same traffic and tokens",
      cheapest: "Cheapest",
      comparedWith: "Compared with",
      monthlySavings: "Monthly savings",
      percentSavings: "Percent savings",
      comparison: "Comparison",
      noPaidTraffic: "No paid traffic yet",
      noEstimatedSavings: "No estimated savings",
      result: "Switching to {model} may save {amount}/mo",
      caveat: "Cost only. Model quality and capability may differ.",
      to: "to",
    },
    table: {
      heading: "Per-model monthly cost",
      description:
        "Select models to compare pricing",
      select: "Sel",
      selectForComparison: "Select up to 2 models for comparison",
      model: "Model",
      provider: "Provider",
      input: "Input",
      output: "Output",
      totalPerMonth: "Total / mo",
      perRequest: "Per req",
      per1KRequests: "Per 1k req",
      perUserPerMonth: "Per user / mo",
      cheapest: "Cheapest",
    },
    comparison: {
      heading: "Model Comparison",
      description: "Compare two selected models side by side",
      metric: "Metric",
      inputCost: "Input Cost",
      outputCost: "Output Cost",
      totalCost: "Total Cost",
      costPerRequest: "Cost / Request",
      costPer1KRequests: "Cost / 1K Requests",
      costPerUserPerMonth: "Cost / User / Month",
      switchingTo: "Switching to",
      saves: "saves",
      perMonth: "per month",
      clear: "Clear",
    },
    sources: {
      heading: "Pricing sources",
      description:
        "Prices are fetched live from the llm-prices open-source project, The Checked date shows when each model's data was last updated at the source",
      input: "Input",
      output: "Output",
      checked: "Checked",
      liveBadge: "Live",
      localBadge: "Local",
      updatedLabel: "Updated",
      cachedBadge: "cached",
      cachedTitle: "Supports prompt caching",
      emptyState: "No pricing data available. Using local fallback.",
    },
    limitations: {
      heading: "Known limitations",
      items: [
        "This is an estimator, not a billing dashboard",
        "Pricing data is fetched live from simonw/llm-prices and may change over time",
        "This project does not call real AI model APIs",
        "No API key is required for the core calculator",
        "The calculator does not include taxes, free tiers, enterprise discounts, regional pricing, latency, model quality, reliability, or rate limits",
        "Token usage varies by tokenizer, language, and provider; the average numbers you enter are rough assumptions",
        "The text token estimator uses the GPT tokenizer locally; Claude and Gemini token counts may differ",
        "Scenario-specific parameters such as RAG chunks and Agent calls are educated defaults, not measurements of your real product",
        "Cache hit rate, cache write cost, TTL, subscriptions, taxes, and regional pricing are not included in this calculator",
        "Exchange rate is a demo rate (live fetch with 7.25 fallback); not a financial-grade FX quote",
      ],
    },
    combo: {
      heading: "Model combo recommendations",
      description:
        "Three realistic routing strategies for the same traffic, Pick an anchor model and a cheap-model share, then compare monthly cost and savings",
      anchorLabel: "Anchor model",
      anchorHint: "Used as the all-high baseline and the fallback in the router scheme",
      routerRatioLabel: "Cheap-model share",
      routerRatioHint: "Share of traffic routed to the cheapest model in scheme B",
      cheapShare: "Cheap",
      highShare: "High",
      monthlyCost: "Monthly cost",
      savings: "Saves",
      savingsNone: "No savings — this is the baseline",
      notEnoughModels:
        "Need at least 2 models in the snapshot to generate combos",
      caveatsHeading: "Caveats",
      latencyNote: "Max latency: {note}",
      batchLatencyValue: "up to 24 hours (async)",
      batchShare: "Batch",
      batchUnavailableCost: "N/A",
      batchSavingsUnavailable: "Savings are not calculated for this option right now",
      schemeA: {
        name: "Scheme A: All-high",
        tagline: "One model for every request — production, complex Q&A, customer support",
        tags: ["Production", "Customer support", "Complex Q&A"],
        caveats: [
          "Same model for every request, Highest quality, highest cost",
          "No fallback to a cheaper model; every request pays the full rate",
        ],
      },
      schemeB: {
        name: "Scheme B: Router",
        tagline: "Cheap model handles the bulk, hard cases escalate to the anchor",
        tags: ["FAQ bots", "Routing", "Classification", "Mixed complexity"],
        caveats: [
          "Quality depends on the router's complexity classifier",
          "The cheap-model share is a user-tunable estimate, not a measurement of your real traffic",
        ],
      },
      schemeC: {
        name: "Scheme C: Batch",
        tagline: "Same anchor model, async batch API with 50% off input and output",
        unsupported:
          "Batch pricing is not available for the selected anchor model's provider in this snapshot",
        notRecommended:
          "This scenario is closer to real-time interaction, so Batch is not recommended",
        tags: ["Offline reports", "Bulk analysis", "Document summarization"],
        caveats: [
          "Up to 24h latency; only suitable for offline or async tasks",
          "Real-time chat or interactive assistants need a synchronous path",
        ],
        unsupportedCaveats: [
          "The selected anchor model's provider has no Batch price in the current snapshot",
          "Keep using normal request pricing unless you verify an official batch price",
        ],
        notRecommendedCaveats: [
          "The selected scenario likely needs an immediate response",
          "Batch can reduce cost for offline jobs, but it can hurt interactive user experience",
        ],
      },
    },
    quickEstimate: {
      heading: "Quick Estimate",
      description: "Estimate monthly API cost from expected model calls, No token math required",
      scenarioLabel: "Use case",
      apiCallsPerDayLabel: "API calls / day",
      apiCallsPerDayHint: "How many model API calls this project may make on an average day",
      daysPerMonthLabel: "Billable days / month",
      daysPerMonthHint: "Use 30 for a normal month, or less for a short test",
      productLensToggle: "Optional product lens",
      activeUsersLabel: "Active users (optional)",
      activeUsersHint: "Only used for product unit economics; it does not change monthly cost",
      inputComplexityLabel: "Input complexity",
      outputLengthLabel: "Output length",
      resultHeading: "Estimated monthly cost",
      cheapestModel: "Cheapest option",
      recommendation: "Recommendation",
      recommendationLine: "{model} is the cheapest option in this snapshot.",
      monthlyRequests: "Monthly requests",
      noTraffic: "Enter usage above to see cost estimates",
      best: "Best",
      noModelsMatch: "No models match your filter criteria",
      placeholder: {
        apiCallsPerDay: "100",
        daysPerMonth: "30",
        activeUsers: "0",
      },
    },
    primaryMode: {
      quick: "Quick Estimate",
      quickDescription: "Fast API cost estimate",
      advanced: "Advanced Setup",
      advancedDescription: "Tune tokens and scenario parameters",
    },
    share: {
      buttonLabel: "Copy share link",
      copied: "Link copied",
      copyFailed: "Copy failed — please copy from address bar",
    },
    quickScenarios: {
      "ai-chatbot": {
        title: "AI Chatbot",
        description: "Simple conversational scenarios like customer service bots, FAQ assistants",
        inputLabels: ["Simple chat", "Normal chat", "Complex multi-turn"],
        outputLabels: ["Short reply", "Medium reply", "Detailed reply"],
      },
      "rag-qa": {
        title: "RAG Q&A",
        description: "Retrieval-augmented Q&A for knowledge base scenarios",
        inputLabels: ["Simple query", "Complex query", "Deep research"],
        outputLabels: ["Brief answer", "Detailed explanation", "Comprehensive analysis"],
      },
      "code-assistant": {
        title: "Code Assistant",
        description: "Code analysis and generation assistance tools",
        inputLabels: ["Single file", "Multi-file", "Full codebase"],
        outputLabels: ["Code snippet", "Complete function", "Project-level changes"],
      },
      "summarizer": {
        title: "Summarizer",
        description: "Document summarization and content condensing",
        inputLabels: ["Short doc (~1 page)", "Long doc (~5 pages)", "Very long doc (~20 pages)"],
        outputLabels: ["Key points", "Summary", "Detailed summary"],
      },
    },
  },
  zh: {
    controls: {
      languageLabel: "语言",
      themeLabel: "显示模式",
      currencyLabel: "货币",
      english: "切换到英文",
      chinese: "切换到中文",
      light: "切换到白天模式",
      dark: "切换到晚上模式",
      currencyUsd: "切换到美元",
      currencyCny: "切换到人民币",
      rateDemo: "演示汇率: 1 USD ≈ 7.25 CNY",
      rateLive: "实时汇率: 1 USD ≈ {rate} CNY",
      fxLive: "实时",
      fxFallback: "回退",
    },
    modelFilter: {
      searchPlaceholder: "搜索模型",
      allProviders: "全部厂家",
      provider: "厂家",
      filterByProvider: "按厂家筛选",
      selectAll: "全选",
      clear: "清除",
      models: "个模型",
      emptyResults: "没有模型符合筛选条件。",
    },
    hero: {
      badge: "AI Cost Lens",
      title: "面向早期 AI 产品的 API 成本模拟器",
      description:
        "选择产品场景，调整真实 token 假设，并基于 OpenAI (GPT)、Anthropic (Claude)、Google (Gemini) 官方价格快照对比每月成本，无需账号、无需 API key、无需外部调用",
      footer:
        "为评估 AI 项目的独立开发者构建，价格数据通过 llm-prices 开源项目获取，做决策前请在各服务商官方页面核对最新价格",
    },
    scenarios: {
      heading: "选择使用场景",
      description:
        "这些预设覆盖常见 AI 产品形态，选择后可以在第 2 步继续微调参数",
      active: "当前",
      items: {
        "ai-chatbot-mvp": {
          title: "AI 聊天机器人 MVP",
          description: "短系统提示词和简短回复的小型聊天产品",
        },
        "rag-knowledge-base": {
          title: "RAG 知识库",
          description: "每次提问注入中等长度检索片段的知识库问答",
        },
        "code-assistant": {
          title: "代码助手",
          description: "较长代码上下文，加上中等长度的代码建议",
        },
        "ai-agent-workflow": {
          title: "AI Agent 工作流",
          description: "包含规划、工具调用和最终回答的多步 Agent 循环",
        },
        "document-summarizer": {
          title: "文档摘要器",
          description: "用户粘贴长文档，模型返回简洁摘要",
        },
      },
    },
    scenarioParams: {
      heading: "调整场景参数",
      description:
        "这些字段会推导当前场景的平均输入和输出 token，切换场景时，其他场景的隐藏字段会重置为预设值",
      avgInput: "平均输入 / 请求",
      avgOutput: "平均输出 / 请求",
      fields: {
        systemPromptTokens: {
          label: "系统提示词 token",
          hint: "角色、约束和产品指令",
        },
        userMessageTokens: {
          label: "用户消息 token",
          hint: "平均用户消息长度",
        },
        historyTokens: {
          label: "近期上下文 token",
          hint: "每次请求携带的对话历史",
        },
        answerTokens: {
          label: "回答 token",
          hint: "平均模型回复长度",
        },
        userQuestionTokens: {
          label: "用户问题 token",
          hint: "平均问题长度",
        },
        topK: {
          label: "检索片段数",
          hint: "每次请求注入多少个 chunk",
        },
        avgChunkTokens: {
          label: "平均 chunk token",
          hint: "每个检索片段的平均 token 长度",
        },
        baseCalls: {
          label: "基础调用 / 任务",
          hint: "重试前计划的模型调用次数",
        },
        retries: {
          label: "重试 / 任务",
          hint: "重试或修订带来的平均额外调用",
        },
        toolResultTokens: {
          label: "工具结果 token",
          hint: "返回给模型的平均工具输出长度",
        },
        finalAnswerTokens: {
          label: "回答 token / 调用",
          hint: "每次模型调用的平均输出",
        },
        codeContextTokens: {
          label: "代码上下文 token",
          hint: "上下文中的文件、片段和诊断信息",
        },
        sessionTurns: {
          label: "会话轮次",
          hint: "一次请求通常产生多少轮输出",
        },
        perTurnOutputTokens: {
          label: "输出 token / 轮",
          hint: "每轮生成的平均代码或解释长度",
        },
        documentTokens: {
          label: "文档 token",
          hint: "平均输入文档长度",
        },
        compressionRatio: {
          label: "压缩比例",
          hint: "0.075 表示输出约为文档的 7.5%",
        },
      },
      notes: {
        chatbot: "输入 = 系统提示词 + 用户消息 + 近期上下文",
        rag: "输入 = 系统提示词 + 用户问题 + topK 个检索片段",
        agent: "输入和输出都会乘以基础调用次数加重试次数",
        code: "输入 = 代码上下文 + 问题；输出随会话轮次增长",
        summarizer: "输出 = 文档 token 乘以压缩比例",
      },
    },
    tokenEstimator: {
      placeholder: "粘贴真实用户消息、代码片段、文档或工具结果",
      tokenizerLabel: "估算 token 数",
      tokensLabel: "tokens",
      approximateNotice:
        "粗略估算（tokenizer 不可用，使用 chars / 4）",
      applyButton: "应用",
      cancelButton: "取消",
      hint: "将设置 {field}（当前值：{current}）",
      tokenizerName: "GPT-4 tokenizer",
      charsLabel: "字符",
      applyAriaLabel: "为 {field} 估算 token",
    },
    mode: {
      heading: "选择计算模式",
      description: "既可以估算预期流量成本，也可以从固定月预算反推可支持请求量",
      trafficMode: "流量模式",
      trafficDescription: "我的预期用量大概要花多少钱？",
      budgetMode: "预算模式",
      budgetDescription: "我的预算最多能支持多少请求？",
    },
    usage: {
      heading: "估算 API 用量",
      description:
        "先直接估算 API 调用量，活跃用户是可选产品视角，只影响每用户成本",
      requestsPerDay: "每日 API 请求数",
      requestsPerDayHint: "平均每天预计产生多少次模型 API 调用",
      daysPerMonth: "每月计费天数",
      daysPerMonthHint: "普通月份可用 30；短期实验可以填更小的数字",
      activeUsers: "活跃用户（可选）",
      activeUsersHint:
        "只用于计算每活跃用户成本，不会改变 token 或月总成本",
      retryRate: "失败重试率",
      retryRateHint:
        "失败请求被重试的比例（0 = 不重试，0.1 = 10%），重试会等比放大总成本",
    },
    summary: {
      heading: "Unit economics 摘要",
      description:
        "摘要使用当前价格快照中最便宜的模型，完整模型拆分见下方表格",
      cheapest: "最便宜",
      cheapestTitle: "当前价格快照中月总成本最低的模型",
      monthlyCost: "月成本",
      costPerRequest: "每请求成本",
      costPer1KRequests: "每 1K 请求成本",
      costPerUserPerMonth: "每用户月成本",
      monthlyRequests: "月请求量",
      inputTokensPerMonth: "每月输入 token",
      outputTokensPerMonth: "每月输出 token",
      estimateNote:
        "成本基于下方价格快照估算，不包含免费额度、税费、企业折扣或速率限制",
      noTraffic: "在第 3 步输入流量后即可看到真实估算数字",
      inView: "当前筛选中",
    },
    budget: {
      heading: "预算控制模式",
      description: "估算固定月度 AI 预算下，每个模型大约可以支持多少次请求",
      monthlyBudget: "每月预算（USD）",
      monthlyBudgetHint:
        "你的 AI 月度硬预算，排行会复用当前场景的 token 假设",
      bestValue: "可跑最多",
      bestValueTitle: "在该预算下可支持请求量最多的模型",
      maxRequests: "最多请求量",
      costPerRequest: "每请求成本",
      costPer1KRequests: "每 1K 请求成本",
      avgInputTokens: "每请求输入",
      avgOutputTokens: "每请求输出",
      budgetLabel: "预算",
      ranking: "预算可跑量排行",
      note:
        "这里复用当前场景 token 假设和官方价格快照，结果是估算，不是账单保证",
      noBudget:
        "输入大于 $0 的月预算，并保持 token 假设大于 0，即可查看可跑量估算",
      emptyRanking: "没有模型符合筛选条件。",
    },
    savings: {
      heading: "模型节省对比",
      description:
        "估算在相同流量和 token 下，把当前快照中成本最高的模型替换为最便宜模型可以节省多少",
      cheapest: "最便宜",
      monthlySavings: "月节省",
      percentSavings: "节省比例",
      comparison: "对比",
      noPaidTraffic: "暂无付费流量",
      to: "切到",
      comparedWith: "对比基准",
      result: "切到 {model}，每月可节省 {amount}",
      noEstimatedSavings: "暂无估算节省",
      caveat: "仅为估算结果。实际成本受缓存、批处理折扣、重试和免费额度影响。",
    },
    table: {
      heading: "各模型月成本",
      description: "勾选模型对比价格",
      select: "选择",
      selectForComparison: "选择最多 2 个模型进行对比",
      model: "模型",
      provider: "服务商",
      input: "输入",
      output: "输出",
      totalPerMonth: "月总计",
      perRequest: "每请求",
      per1KRequests: "每 1K 请求",
      perUserPerMonth: "每用户 / 月",
      cheapest: "最便宜",
    },
    comparison: {
      heading: "模型对比",
      description: "并排对比两个选中的模型",
      metric: "指标",
      inputCost: "输入成本",
      outputCost: "输出成本",
      totalCost: "总成本",
      costPerRequest: "每请求成本",
      costPer1KRequests: "每 1K 请求成本",
      costPerUserPerMonth: "每用户月成本",
      switchingTo: "切换到",
      saves: "每月可节省",
      perMonth: "",
      clear: "清除",
    },
    sources: {
      heading: "价格来源",
      description:
        "价格数据通过 llm-prices 开源项目实时获取，Checked 日期表示该数据在来源处的最后更新时间",
      input: "输入",
      output: "输出",
      checked: "已核对",
      liveBadge: "实时",
      localBadge: "本地",
      updatedLabel: "更新时间",
      cachedBadge: "支持缓存",
      cachedTitle: "支持 prompt 缓存",
      emptyState: "暂无价格数据，已切换到本地回退。",
    },
    limitations: {
      heading: "已知限制",
      items: [
        "这是成本估算器，不是账单后台",
        "价格数据通过 llm-prices 开源项目实时获取，价格可能随时变化",
        "本项目不会调用真实 AI 模型 API",
        "核心计算器不需要任何 API key",
        "计算器不包含税费、免费额度、企业折扣、区域价格、延迟、模型质量、可靠性或速率限制",
        "Token 用量会受到 tokenizer、语言和服务商影响；你输入的平均值只是粗略假设",
        "文本 Token 估算器在浏览器本地使用 GPT tokenizer；Claude 和 Gemini 的 token 数可能不同",
        "RAG chunk 数和 Agent 调用次数等场景参数是经验默认值，不是你的真实产品测量结果",
        "Cache 命中率、缓存写入费用、TTL、订阅折扣、税费和区域价格不在本计算器范围内",
        "汇率为演示汇率（动态拉取，失败回退 7.25），不是金融级实时报价",
      ],
    },
    combo: {
      heading: "模型组合推荐",
      description:
        "同一流量下的三种实用路由策略，选择一个基准模型和便宜模型占比，查看月成本和节省对比",
      anchorLabel: "基准模型",
      anchorHint: "作为方案 A 的全程高级基线，也是方案 B 路由失败时的兜底",
      routerRatioLabel: "便宜模型占比",
      routerRatioHint: "方案 B 中路由到最便宜模型的请求比例",
      cheapShare: "便宜",
      highShare: "高级",
      monthlyCost: "月成本",
      savings: "节省",
      savingsNone: "无节省 —— 即基准方案",
      notEnoughModels: "快照中至少需要 2 个模型才能生成组合方案",
      caveatsHeading: "注意事项",
      latencyNote: "最大延迟：{note}",
      batchLatencyValue: "最长 24 小时（异步）",
      batchShare: "批处理",
      batchUnavailableCost: "N/A",
      batchSavingsUnavailable: "当前不计算该方案的节省",
      schemeA: {
        name: "方案 A：全程高级",
        tagline: "所有请求都走同一个模型 —— 适合正式产品、复杂问答、客服对话",
        tags: ["正式产品", "客服对话", "复杂问答"],
        caveats: [
          "所有请求都使用同一个模型，质量更稳，但成本最高",
          "没有便宜模型兜底或分流，每次请求都按完整价格估算",
        ],
      },
      schemeB: {
        name: "方案 B：路由分流",
        tagline: "便宜模型处理大部分请求，复杂问题升级到基准模型",
        tags: ["FAQ 机器人", "路由分流", "分类任务", "复杂度混合"],
        caveats: [
          "效果取决于路由器对问题复杂度的判断质量",
          "便宜模型占比是用户可调估算，不代表真实流量测量结果",
        ],
      },
      schemeC: {
        name: "方案 C：批处理",
        tagline: "使用同一个基准模型，异步批处理 API，输入输出各打 5 折",
        unsupported: "当前基准模型所属服务商在本快照中没有 Batch 价格数据",
        notRecommended: "当前场景更偏实时交互，不建议使用 Batch",
        tags: ["离线报告", "批量分析", "文档总结"],
        caveats: [
          "最长可能有 24 小时延迟，只适合离线或异步任务",
          "实时聊天或交互式助手通常需要同步请求路径",
        ],
        unsupportedCaveats: [
          "当前基准模型所属服务商在价格快照中没有 Batch 价格",
          "除非去官方页面核实到批处理价格，否则应按普通请求价格估算",
        ],
        notRecommendedCaveats: [
          "当前场景通常需要即时返回结果",
          "Batch 可能降低离线任务成本，但会影响交互式产品体验",
        ],
      },
    },
    quickEstimate: {
      heading: "快速估算",
      description: "根据预计模型 API 调用量估算月成本，无需了解 token 计算",
      scenarioLabel: "使用场景",
      apiCallsPerDayLabel: "每日 API 调用量",
      apiCallsPerDayHint: "这个项目平均每天大概会调用多少次模型 API",
      daysPerMonthLabel: "每月计费天数",
      daysPerMonthHint: "普通月份用 30；短期实验可以填更小的数字",
      productLensToggle: "可选产品视角",
      activeUsersLabel: "活跃用户数（可选）",
      activeUsersHint: "只用于估算每用户成本；不会改变月总成本",
      inputComplexityLabel: "输入复杂度",
      outputLengthLabel: "输出长度",
      resultHeading: "预计月成本",
      cheapestModel: "最便宜方案",
      recommendation: "建议",
      recommendationLine: "{model} 是当前价格快照中最便宜的方案。",
      monthlyRequests: "月请求量",
      noTraffic: "输入用量后可查看成本估算",
      best: "最便宜",
      noModelsMatch: "没有模型符合筛选条件",
      placeholder: {
        apiCallsPerDay: "100",
        daysPerMonth: "30",
        activeUsers: "0",
      },
    },
    primaryMode: {
      quick: "快速估算",
      quickDescription: "快速估算 API 成本",
      advanced: "高级设置",
      advancedDescription: "调整 token 和场景参数",
    },
    share: {
      buttonLabel: "复制分享链接",
      copied: "链接已复制",
      copyFailed: "复制失败，请手动从地址栏复制",
    },
    quickScenarios: {
      "ai-chatbot": {
        title: "AI 客服",
        description: "简单对话场景，适合客服机器人、FAQ 等",
        inputLabels: ["简单对话", "常规对话", "复杂多轮"],
        outputLabels: ["简短回复", "中等回复", "详细回复"],
      },
      "rag-qa": {
        title: "RAG 问答",
        description: "检索增强问答，适合知识库问答场景",
        inputLabels: ["简单问题", "复杂查询", "深度研究"],
        outputLabels: ["简短回答", "详细解释", "全方位分析"],
      },
      "code-assistant": {
        title: "代码助手",
        description: "代码分析和生成辅助工具",
        inputLabels: ["单文件", "多文件", "全代码库"],
        outputLabels: ["代码片段", "完整函数", "项目级修改"],
      },
      "summarizer": {
        title: "总结工具",
        description: "文档摘要和内容总结",
        inputLabels: ["短文 (~1页)", "长文 (~5页)", "超长文 (~20页)"],
        outputLabels: ["要点总结", "摘要", "详细总结"],
      },
    },
  },
};
