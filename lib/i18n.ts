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
  };
  modelFilter: {
    searchPlaceholder: string;
    allProviders: string;
    provider: string;
    filterByProvider: string;
    selectAll: string;
    clear: string;
    models: string;
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
    heading: string;
    description: string;
    textareaLabel: string;
    placeholder: string;
    tokenizerLabel: string;
    tokensLabel: string;
    characters: string;
    limitNotice: string;
    approximateNotice: string;
    applyButton: string;
    applyHint: string;
    targets: Record<ScenarioKind, string>;
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
    estimatedSpend: string;
    unusedBudget: string;
    avgInputTokens: string;
    avgOutputTokens: string;
    budgetLabel: string;
    ranking: string;
    model: string;
    provider: string;
    note: string;
    noBudget: string;
  };
  savings: {
    heading: string;
    description: string;
    cheapest: string;
    monthlySavings: string;
    percentSavings: string;
    comparison: string;
    noPaidTraffic: string;
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
  };
  limitations: {
    heading: string;
    items: string[];
  };
  // TODO(P0): 新增 copy.costBreakdown 段落：
  //   inputCost / outputCost / cachedInputCost / retryCost / fxImpact / batchDiscount
  // TODO(P0): 新增 copy.optimization 段落（成本优化建议区块的 i18n）
  // TODO(P0): 新增 copy.quickEstimate 段落（快速估算模式的 UI 文案）
  quickEstimate: {
    heading: string;
    description: string;
    scenarioLabel: string;
    dailyUsersLabel: string;
    dailyUsersHint: string;
    requestsPerUserLabel: string;
    requestsPerUserHint: string;
    inputComplexityLabel: string;
    outputLengthLabel: string;
    resultHeading: string;
    cheapestModel: string;
    recommendation: string;
    monthlyRequests: string;
    noTraffic: string;
  };
  primaryMode: {
    quick: string;
    quickDescription: string;
    advanced: string;
    advancedDescription: string;
  };
  // TODO(P1): 新增 copy.batchMode 段落（批处理模式开关和说明）
  // TODO(P1): 新增 copy.combo 段落（模型组合推荐的标题和选项文案）
  // TODO(P1): 新增 copy.export 段落（导出 Markdown / JSON 按钮文案）
  // TODO(P1): 新增 copy.billingMode 段落（Token/Runtime/Output 三种计费模型说明）
  // TODO(P2): 新增 copy.imageCost 段落（图片成本估算器的 UI 文案）
}

export const COPY: Record<Language, AppCopy> = {
  en: {
    controls: {
      languageLabel: "Language",
      themeLabel: "Display",
      currencyLabel: "Currency",
      english: "Switch to English",
      chinese: "切换到中文",
      light: "Switch to day mode",
      dark: "Switch to night mode",
      currencyUsd: "Switch to USD",
      currencyCny: "切换到人民币",
      rateDemo: "Demo rate: 1 USD ≈ 7.25 CNY",
      rateLive: "Live rate: 1 USD ≈ {rate} CNY",
    },
    modelFilter: {
      searchPlaceholder: "Search models...",
      allProviders: "All Providers",
      provider: "Provider",
      filterByProvider: "Filter by Provider",
      selectAll: "All",
      clear: "Clear",
      models: "models",
    },
    hero: {
      badge: "AI Cost Lens",
      title: "AI API cost simulator for early-stage products.",
      description:
        "Pick a product scenario, tune the token assumptions behind it, and compare monthly cost across official OpenAI (GPT), Anthropic (Claude), and Google (Gemini) pricing snapshots. No account, no API key, no external calls.",
      footer:
        "Built for indie devs evaluating an AI project. Data is a manual snapshot; verify the latest price on the linked official page before making a decision.",
    },
    scenarios: {
      heading: "1. Pick a scenario",
      description:
        "Starting presets for common AI project shapes. Tweak the numbers in step 2 afterwards.",
      active: "Active",
      items: {
        "ai-chatbot-mvp": {
          title: "AI Chatbot MVP",
          description:
            "A small chat product with short system prompts and brief replies.",
        },
        "rag-knowledge-base": {
          title: "RAG Knowledge Base",
          description:
            "Retrieval-augmented Q&A with medium-length context chunks injected per query.",
        },
        "code-assistant": {
          title: "Code Assistant",
          description: "Long file context plus medium-length code suggestions.",
        },
        "ai-agent-workflow": {
          title: "AI Agent Workflow",
          description:
            "Multi-step agent loop with planning, tool calls and final answers per user turn.",
        },
        "document-summarizer": {
          title: "Document Summarizer",
          description:
            "Users paste long documents and the model returns a concise summary.",
        },
      },
    },
    scenarioParams: {
      heading: "2. Tune scenario assumptions",
      description:
        "These fields drive the average input and output tokens for the active scenario. Hidden fields from other scenarios are reset when you switch.",
      avgInput: "Avg input / request",
      avgOutput: "Avg output / request",
      fields: {
        systemPromptTokens: {
          label: "System prompt tokens",
          hint: "Persona, guardrails, and product instructions.",
        },
        userMessageTokens: {
          label: "User message tokens",
          hint: "Average user message length.",
        },
        historyTokens: {
          label: "Recent history tokens",
          hint: "Conversation context carried into each request.",
        },
        answerTokens: {
          label: "Answer tokens",
          hint: "Average model response length.",
        },
        userQuestionTokens: {
          label: "User question tokens",
          hint: "Average question length.",
        },
        topK: {
          label: "Retrieved chunks",
          hint: "How many chunks are injected per request.",
        },
        avgChunkTokens: {
          label: "Avg chunk tokens",
          hint: "Average token length per retrieved chunk.",
        },
        baseCalls: {
          label: "Base calls / task",
          hint: "Planned model calls before retries.",
        },
        retries: {
          label: "Retries / task",
          hint: "Average extra calls from retries or revisions.",
        },
        toolResultTokens: {
          label: "Tool result tokens",
          hint: "Average tool output returned to the model.",
        },
        finalAnswerTokens: {
          label: "Answer tokens / call",
          hint: "Average output per model call.",
        },
        codeContextTokens: {
          label: "Code context tokens",
          hint: "Files, snippets, and diagnostics in context.",
        },
        sessionTurns: {
          label: "Session turns",
          hint: "How many output turns a request usually creates.",
        },
        perTurnOutputTokens: {
          label: "Output tokens / turn",
          hint: "Average code or explanation generated per turn.",
        },
        documentTokens: {
          label: "Document tokens",
          hint: "Average input document length.",
        },
        compressionRatio: {
          label: "Compression ratio",
          hint: "0.075 means output is about 7.5% of the document.",
        },
      },
      notes: {
        chatbot: "Input = system prompt + user message + recent history.",
        rag: "Input = system prompt + user question + topK retrieved chunks.",
        agent: "Input/output are multiplied by base calls plus retries.",
        code: "Input = code context + question; output scales with session turns.",
        summarizer: "Output = document tokens multiplied by compression ratio.",
      },
    },
    tokenEstimator: {
      heading: "3. Estimate tokens from real text",
      description:
        "Paste a real prompt, code snippet, document, or tool result. The count uses the GPT-4 tokenizer locally in your browser; Claude and Gemini may tokenize the same text differently.",
      textareaLabel: "Sample text",
      placeholder:
        "Paste a real user message, RAG question, code context, document, or tool result...",
      tokenizerLabel: "GPT-4 tokenizer",
      tokensLabel: "tokens in this sample",
      characters: "characters",
      limitNotice: "Text was capped at the local safety limit.",
      approximateNotice:
        "Tokenizer failed to load, so this is an approximate characters / 4 estimate.",
      applyButton: "Apply to current scenario",
      applyHint: "Applies this count to {target}.",
      targets: {
        chatbot: "User message tokens",
        rag: "User question tokens",
        agent: "Tool result tokens",
        code: "Code context tokens",
        summarizer: "Document tokens",
      },
    },
    mode: {
      heading: "4. Choose calculation mode",
      description:
        "Estimate expected traffic cost, or reverse the question from a fixed monthly budget.",
      trafficMode: "Traffic Mode",
      trafficDescription: "How much will my expected usage cost?",
      budgetMode: "Budget Mode",
      budgetDescription: "How many requests can my budget support?",
    },
    usage: {
      heading: "5. Estimate API usage",
      description:
        "Estimate direct API call volume first. Active users are optional and only affect the per-user product lens.",
      requestsPerDay: "API requests / day",
      requestsPerDayHint:
        "How many model API calls you expect on an average day.",
      daysPerMonth: "Billable days / month",
      daysPerMonthHint:
        "Use 30 for a normal month, or a smaller number for experiments.",
      activeUsers: "Active users (optional)",
      activeUsersHint:
        "Only used for cost per active user; it does not change tokens or monthly cost.",
      retryRate: "Retry rate",
      retryRateHint:
        "Share of failed requests that are retried (0 = none, 0.1 = 10%). Retries multiply total cost.",
    },
    summary: {
      heading: "5. Unit economics summary",
      description:
        "Summary uses the cheapest model in the current pricing snapshot. The full per-model breakdown follows below.",
      cheapest: "Cheapest",
      cheapestTitle: "Lowest monthly total cost across the snapshot models.",
      monthlyCost: "Monthly cost",
      costPerRequest: "Cost / request",
      costPer1KRequests: "Cost / 1K requests",
      costPerUserPerMonth: "Cost / user / mo",
      monthlyRequests: "Monthly requests",
      inputTokensPerMonth: "Input tokens / mo",
      outputTokensPerMonth: "Output tokens / mo",
      estimateNote:
        "Costs are estimates based on the snapshot prices below. They do not include free tiers, taxes, enterprise discounts, or rate limits.",
      noTraffic: "Enter some traffic in step 3 to see real numbers.",
    },
    budget: {
      heading: "Budget mode",
      description:
        "Estimate how many requests each model can support under a fixed monthly AI budget.",
      monthlyBudget: "Monthly budget (USD)",
      monthlyBudgetHint:
        "Your hard monthly AI budget. The ranking reuses the current scenario token assumptions.",
      bestValue: "Most runway",
      bestValueTitle: "The model that supports the most requests under this budget.",
      maxRequests: "Max requests",
      costPerRequest: "Cost / request",
      costPer1KRequests: "Cost / 1K requests",
      estimatedSpend: "Estimated spend",
      unusedBudget: "Unused budget",
      avgInputTokens: "Input / request",
      avgOutputTokens: "Output / request",
      budgetLabel: "Budget",
      ranking: "Budget runway ranking",
      model: "Model",
      provider: "Provider",
      note:
        "This uses the current scenario token assumptions and official pricing snapshot. It is an estimate, not a billing guarantee.",
      noBudget:
        "Enter a monthly budget above $0 and keep token assumptions above 0 to see runway estimates.",
    },
    savings: {
      heading: "6. Model savings comparison",
      description:
        "Estimated savings if the highest-cost model in this snapshot is replaced by the cheapest model for the same traffic and tokens.",
      cheapest: "Cheapest",
      monthlySavings: "Monthly savings",
      percentSavings: "Percent savings",
      comparison: "Comparison",
      noPaidTraffic: "No paid traffic yet",
      to: "to",
    },
    table: {
      heading: "7. Per-model monthly cost",
      description:
        "Scroll horizontally on small screens. Cheapest model is highlighted.",
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
      description: "Compare two selected models side by side.",
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
      heading: "8. Pricing sources",
      description:
        "All numbers are manually collected from each provider's official pricing page. The Checked date is when the snapshot was last verified.",
      input: "Input",
      output: "Output",
      checked: "Checked",
    },
    limitations: {
      heading: "Known limitations",
      items: [
        "This is an estimator, not a billing dashboard.",
        "Pricing data is manually collected from official provider pricing pages and may change after the checked date.",
        "This project does not call real AI model APIs.",
        "No API key is required for the core calculator.",
        "The calculator does not include taxes, free tiers, enterprise discounts, regional pricing, latency, model quality, reliability, or rate limits.",
        "Token usage varies by tokenizer, language, and provider; the average numbers you enter are rough assumptions.",
        "The text token estimator uses the GPT tokenizer locally; Claude and Gemini token counts may differ.",
        "Scenario-specific parameters such as RAG chunks and Agent calls are educated defaults, not measurements of your real product.",
        "Cache hit rate, cache write cost, TTL, subscriptions, taxes, and regional pricing are not included in this P0 calculator.",
        "Exchange rate is a demo rate (live fetch with 7.25 fallback); not a financial-grade FX quote.",
      ],
    },
    quickEstimate: {
      heading: "Quick Estimate",
      description: "Answer a few simple questions to get a rough monthly cost. No token math required.",
      scenarioLabel: "Use case",
      dailyUsersLabel: "Expected daily active users",
      dailyUsersHint: "How many users interact with your AI per day",
      requestsPerUserLabel: "Requests per user / day",
      requestsPerUserHint: "Average API calls each user makes per day",
      inputComplexityLabel: "Input complexity",
      outputLengthLabel: "Output length",
      resultHeading: "Estimated monthly cost",
      cheapestModel: "Cheapest option",
      recommendation: "Recommendation",
      monthlyRequests: "Monthly requests",
      noTraffic: "Enter usage above to see cost estimates",
    },
    primaryMode: {
      quick: "Quick Estimate",
      quickDescription: "For non-technical users",
      advanced: "Advanced Mode",
      advancedDescription: "For developers who know their tokens",
    },
  },
  zh: {
    controls: {
      languageLabel: "语言",
      themeLabel: "显示模式",
      currencyLabel: "货币",
      english: "Switch to English",
      chinese: "切换到中文",
      light: "切换到白天模式",
      dark: "切换到晚上模式",
      currencyUsd: "切换到美元",
      currencyCny: "Switch to CNY",
      rateDemo: "演示汇率: 1 USD ≈ 7.25 CNY",
      rateLive: "实时汇率: 1 USD ≈ {rate} CNY",
    },
    modelFilter: {
      searchPlaceholder: "搜索模型...",
      allProviders: "全部厂家",
      provider: "厂家",
      filterByProvider: "按厂家筛选",
      selectAll: "全选",
      clear: "清除",
      models: "个模型",
    },
    hero: {
      badge: "AI Cost Lens",
      title: "面向早期 AI 产品的 API 成本模拟器。",
      description:
        "选择产品场景，调整真实 token 假设，并基于 OpenAI (GPT)、Anthropic (Claude)、Google (Gemini) 官方价格快照对比每月成本。无需账号、无需 API key、无需外部调用。",
      footer:
        "为评估 AI 项目的独立开发者构建。价格数据是人工快照，做决策前请在链接的官方页面核对最新价格。",
    },
    scenarios: {
      heading: "1. 选择使用场景",
      description:
        "这些预设覆盖常见 AI 产品形态。选择后可以在第 2 步继续微调参数。",
      active: "当前",
      items: {
        "ai-chatbot-mvp": {
          title: "AI 聊天机器人 MVP",
          description: "短系统提示词和简短回复的小型聊天产品。",
        },
        "rag-knowledge-base": {
          title: "RAG 知识库",
          description: "每次提问注入中等长度检索片段的知识库问答。",
        },
        "code-assistant": {
          title: "代码助手",
          description: "较长代码上下文，加上中等长度的代码建议。",
        },
        "ai-agent-workflow": {
          title: "AI Agent 工作流",
          description: "包含规划、工具调用和最终回答的多步 Agent 循环。",
        },
        "document-summarizer": {
          title: "文档摘要器",
          description: "用户粘贴长文档，模型返回简洁摘要。",
        },
      },
    },
    scenarioParams: {
      heading: "2. 调整场景参数",
      description:
        "这些字段会推导当前场景的平均输入和输出 token。切换场景时，其他场景的隐藏字段会重置为预设值。",
      avgInput: "平均输入 / 请求",
      avgOutput: "平均输出 / 请求",
      fields: {
        systemPromptTokens: {
          label: "系统提示词 token",
          hint: "角色、约束和产品指令。",
        },
        userMessageTokens: {
          label: "用户消息 token",
          hint: "平均用户消息长度。",
        },
        historyTokens: {
          label: "近期上下文 token",
          hint: "每次请求携带的对话历史。",
        },
        answerTokens: {
          label: "回答 token",
          hint: "平均模型回复长度。",
        },
        userQuestionTokens: {
          label: "用户问题 token",
          hint: "平均问题长度。",
        },
        topK: {
          label: "检索片段数",
          hint: "每次请求注入多少个 chunk。",
        },
        avgChunkTokens: {
          label: "平均 chunk token",
          hint: "每个检索片段的平均 token 长度。",
        },
        baseCalls: {
          label: "基础调用 / 任务",
          hint: "重试前计划的模型调用次数。",
        },
        retries: {
          label: "重试 / 任务",
          hint: "重试或修订带来的平均额外调用。",
        },
        toolResultTokens: {
          label: "工具结果 token",
          hint: "返回给模型的平均工具输出长度。",
        },
        finalAnswerTokens: {
          label: "回答 token / 调用",
          hint: "每次模型调用的平均输出。",
        },
        codeContextTokens: {
          label: "代码上下文 token",
          hint: "上下文中的文件、片段和诊断信息。",
        },
        sessionTurns: {
          label: "会话轮次",
          hint: "一次请求通常产生多少轮输出。",
        },
        perTurnOutputTokens: {
          label: "输出 token / 轮",
          hint: "每轮生成的平均代码或解释长度。",
        },
        documentTokens: {
          label: "文档 token",
          hint: "平均输入文档长度。",
        },
        compressionRatio: {
          label: "压缩比例",
          hint: "0.075 表示输出约为文档的 7.5%。",
        },
      },
      notes: {
        chatbot: "输入 = 系统提示词 + 用户消息 + 近期上下文。",
        rag: "输入 = 系统提示词 + 用户问题 + topK 个检索片段。",
        agent: "输入和输出都会乘以基础调用次数加重试次数。",
        code: "输入 = 代码上下文 + 问题；输出随会话轮次增长。",
        summarizer: "输出 = 文档 token 乘以压缩比例。",
      },
    },
    tokenEstimator: {
      heading: "3. 用真实文本估算 Token",
      description:
        "粘贴一段真实提示词、代码片段、文档或工具结果。计数会在浏览器本地使用 GPT-4 tokenizer；Claude 和 Gemini 对同一文本的 token 结果可能不同。",
      textareaLabel: "示例文本",
      placeholder: "粘贴真实用户消息、RAG 问题、代码上下文、文档或工具结果...",
      tokenizerLabel: "GPT-4 tokenizer",
      tokensLabel: "该样本的 token 数",
      characters: "字符",
      limitNotice: "文本已被限制在本地安全长度内。",
      approximateNotice:
        "Tokenizer 加载失败，因此这里使用 characters / 4 的粗略估算。",
      applyButton: "应用到当前场景",
      applyHint: "会把这个数值写入：{target}。",
      targets: {
        chatbot: "用户消息 token",
        rag: "用户问题 token",
        agent: "工具结果 token",
        code: "代码上下文 token",
        summarizer: "文档 token",
      },
    },
    mode: {
      heading: "4. 选择计算模式",
      description: "既可以估算预期流量成本，也可以从固定月预算反推可支持请求量。",
      trafficMode: "流量模式",
      trafficDescription: "我的预期用量大概要花多少钱？",
      budgetMode: "预算控制模式",
      budgetDescription: "我的预算最多能支持多少请求？",
    },
    usage: {
      heading: "5. 估算 API 用量",
      description:
        "先直接估算 API 调用量。活跃用户是可选产品视角，只影响每用户成本。",
      requestsPerDay: "每日 API 请求数",
      requestsPerDayHint: "平均每天预计产生多少次模型 API 调用。",
      daysPerMonth: "每月计费天数",
      daysPerMonthHint: "普通月份可用 30；短期实验可以填更小的数字。",
      activeUsers: "活跃用户（可选）",
      activeUsersHint:
        "只用于计算每活跃用户成本，不会改变 token 或月总成本。",
      retryRate: "失败重试率",
      retryRateHint:
        "失败请求被重试的比例（0 = 不重试，0.1 = 10%）。重试会等比放大总成本。",
    },
    summary: {
      heading: "5. Unit economics 摘要",
      description:
        "摘要使用当前价格快照中最便宜的模型。完整模型拆分见下方表格。",
      cheapest: "最便宜",
      cheapestTitle: "当前价格快照中月总成本最低的模型。",
      monthlyCost: "月成本",
      costPerRequest: "每请求成本",
      costPer1KRequests: "每 1K 请求成本",
      costPerUserPerMonth: "每用户月成本",
      monthlyRequests: "月请求量",
      inputTokensPerMonth: "每月输入 token",
      outputTokensPerMonth: "每月输出 token",
      estimateNote:
        "成本基于下方价格快照估算，不包含免费额度、税费、企业折扣或速率限制。",
      noTraffic: "在第 3 步输入流量后即可看到真实估算数字。",
    },
    budget: {
      heading: "预算控制模式",
      description: "估算固定月度 AI 预算下，每个模型大约可以支持多少次请求。",
      monthlyBudget: "每月预算（USD）",
      monthlyBudgetHint:
        "你的 AI 月度硬预算。排行会复用当前场景的 token 假设。",
      bestValue: "可跑最多",
      bestValueTitle: "在该预算下可支持请求量最多的模型。",
      maxRequests: "最多请求量",
      costPerRequest: "每请求成本",
      costPer1KRequests: "每 1K 请求成本",
      estimatedSpend: "预计花费",
      unusedBudget: "剩余预算",
      avgInputTokens: "每请求输入",
      avgOutputTokens: "每请求输出",
      budgetLabel: "预算",
      ranking: "预算可跑量排行",
      model: "模型",
      provider: "服务商",
      note:
        "这里复用当前场景 token 假设和官方价格快照。结果是估算，不是账单保证。",
      noBudget:
        "输入大于 $0 的月预算，并保持 token 假设大于 0，即可查看可跑量估算。",
    },
    savings: {
      heading: "6. 模型节省对比",
      description:
        "估算在相同流量和 token 下，把当前快照中成本最高的模型替换为最便宜模型可以节省多少。",
      cheapest: "最便宜",
      monthlySavings: "月节省",
      percentSavings: "节省比例",
      comparison: "对比",
      noPaidTraffic: "暂无付费流量",
      to: "切到",
    },
    table: {
      heading: "7. 各模型月成本",
      description: "小屏幕可横向滚动。最便宜模型会被高亮。",
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
      description: "并排对比两个选中的模型。",
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
      heading: "8. 价格来源",
      description:
        "所有数字均人工采集自各服务商官方价格页面。Checked 日期表示该快照最后核对时间。",
      input: "输入",
      output: "输出",
      checked: "已核对",
    },
    limitations: {
      heading: "已知限制",
      items: [
        "这是成本估算器，不是账单后台。",
        "价格数据人工采集自官方价格页面，可能在核对日期后发生变化。",
        "本项目不会调用真实 AI 模型 API。",
        "核心计算器不需要任何 API key。",
        "计算器不包含税费、免费额度、企业折扣、区域价格、延迟、模型质量、可靠性或速率限制。",
        "Token 用量会受到 tokenizer、语言和服务商影响；你输入的平均值只是粗略假设。",
        "文本 Token 估算器在浏览器本地使用 GPT tokenizer；Claude 和 Gemini 的 token 数可能不同。",
        "RAG chunk 数和 Agent 调用次数等场景参数是经验默认值，不是你的真实产品测量结果。",
        "这个 P0 计算器暂不包含缓存命中率、缓存写入成本、TTL、订阅收入、税费和区域价格。",
        "汇率为演示汇率（动态拉取，失败回退 7.25），不是金融级实时报价。",
      ],
    },
    quickEstimate: {
      heading: "快速估算",
      description: "回答几个简单问题，快速估算月成本。无需了解 token 计算。",
      scenarioLabel: "使用场景",
      dailyUsersLabel: "预计日活用户数",
      dailyUsersHint: "每天有多少用户使用你的 AI 产品",
      requestsPerUserLabel: "每人每天调用次数",
      requestsPerUserHint: "每位用户平均每天发起多少次 API 调用",
      inputComplexityLabel: "输入复杂度",
      outputLengthLabel: "输出长度",
      resultHeading: "预计月成本",
      cheapestModel: "最便宜方案",
      recommendation: "建议",
      monthlyRequests: "月请求量",
      noTraffic: "输入用量后可查看成本估算",
    },
    primaryMode: {
      quick: "快速估算",
      quickDescription: "适合普通用户",
      advanced: "高级模式",
      advancedDescription: "适合懂 token 的开发者",
    },
  },
};
