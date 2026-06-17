# AI Cost Lens（AI 成本透镜）

> 一个面向早期 AI 产品的 API 成本模拟器。
> 在正式上线前，先回答一个问题：
> 「我这个 AI 功能每月大概要烧多少钱？应该选哪个模型？」

- [English](./README.md) | [简体中文](./README.zh-CN.md)
- 无需账号、无需 API key、不会在服务端调用任何真实模型。
- 全部计算在浏览器内本地完成。

## 在线演示

Vercel 部署：<https://ai-cost-lens.vercel.app>

> 如果链接尚未生效，请按下方 [本地运行](#本地运行) 章节在本地启动。

## 这是什么

AI Cost Lens 不是一张价格表，而是一个 **AI 产品上线前的成本模拟器**。

它帮你回答的不是「哪个模型便宜」，而是：

> 「如果我把这个 AI 功能上线，每月大概要烧多少钱？如果切到更便宜的
> 模型，能省多少？在我给定的预算下，能跑多少请求？」

具体来说，它会：

- 让你从常见产品形态出发：AI 聊天机器人 MVP、RAG 知识库、代码助手、
  AI Agent 工作流、文档摘要器；
- 用场景专属的参数推导平均 input / output token（RAG 的 `topK` × 块
  token、Agent 的基础调用 + 重试、Code 上下文长度、Summarizer 压缩比
  等），而不是只填一个干巴巴的数字；
- 让你粘贴真实文本、代码或文档，在浏览器里用 GPT tokenizer 估 token
  数，然后一键填进当前场景对应的字段；
- 横向对比快照里所有模型在「月成本 / 每请求 / 每 1K 请求 / 每活跃用户
  / 月」四个维度的数字；
- 高亮最便宜模型，并显示「从最贵模型切到最便宜模型」能省多少绝对金额
  和百分比；
- 提供 **预算模式（Budget Mode）**：给定一个固定的月度 AI 预算，反推
  每个模型能支持多少次请求；
- 提供 **模型组合方案（Model Combo）**：在同样流量下，对比「全程高级 /
  路由分流 / 异步批处理」三种方案的真实成本和权衡。

## 功能列表

- **场景感知的成本建模**：覆盖 Chatbot / RAG / Code Assistant / Agent /
  Summarizer 五种形态，不是平的「单价 × token」对比表。
- **快速估算（Quick Estimate）模式**：给不懂 token 的用户准备，选使用
  场景 + 输入输出长度档位（简单对话 / 深度研究 / 整库代码等）。
- **高级设置（Advanced Setup）模式**：给深度用户准备，可以细调每个场景
  的所有参数。
- **本地 Token 估算器**：在浏览器内用 `js-tiktoken`（GPT-4 tokenizer）
  跑真实文本的 token 计数，可一键写入当前场景的对应字段。
- **Unit economics 摘要卡**：月成本 / 每请求成本 / 每 1K 请求成本 /
  每活跃用户月成本。
- **模型节省对比**：与快照中最贵模型相比，能省多少 **绝对金额** 和
  **百分比**。
- **预算模式**：按月预算反推每个模型能跑多少请求，并给可跑量排行榜。
- **模型组合推荐**：全程高级 / 路由分流 / 异步批处理 三种方案，含
  实际适用场景和注意事项。
- **USD / CNY 货币切换**：演示汇率（动态拉取 + 7.25 固定回退）。
- **中英双语切换** + **白天 / 夜晚显示模式**。
- **分享链接**：当前场景和参数自动写入 URL。
- **移动端友好**：对比表格可横向滚动。
- **数字输入安全网**：空值、非数字、负数、极大值都会被 `toSafeNumber`
  兜住，UI 永远不会出现 `NaN` / `Infinity` / `undefined` / `null`。
- **价格数据本地回退**：在线 API 拉不到时，自动切到打包的静态快照。

## 技术栈

- [Next.js 16](https://nextjs.org/)（App Router）
- [React 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [`js-tiktoken`](https://github.com/dqbd/tiktoken)：浏览器内 GPT
  tokenizer
- 价格数据：[`simonw/llm-prices`](https://github.com/simonw/llm-prices)
  （开源，MIT）
- 部署：Vercel 静态部署

## 本地运行

需要 **Node.js 20 或更高版本**。

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。

其他常用脚本：

```bash
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript 类型检查
npm run build     # 生产构建
npm run start     # 跑生产构建
```

不需要任何环境变量。价格 API 请求是浏览器在运行时发出的，如果失败，
会回退到 `lib/pricing.ts` 里打包的静态快照。

## 价格数据策略

- 默认价格快照通过 [`simonw/llm-prices`](https://github.com/simonw/llm-prices)
  实时拉取（`current-v1.json`）。
- 在 `lib/pricing.ts` 里打包了一份 6 个模型的静态回退表：OpenAI
  GPT-4o / GPT-4o-mini、Anthropic Claude 3.5 Haiku / Sonnet、Google
  Gemini 1.5 Flash / Pro。当在线 API 不可用时自动切换。
- 每条模型数据都包含：服务商、模型 id、显示名、每 1M token 输入价 /
  输出价、官方价格页 URL、核对日期、可选备注。
- 价格随时可能变化，**在做出真实产品或预算决策前，请到对应官方价格页
  核对最新价格**。
- 本项目不声称价格是「实时准确」的；UI 的「Pricing sources」表格会
  明确标注数据来源（Live / Local / cached）。

## 已知限制

- 这是成本估算器 / 成本模拟器，**不是**账单后台。
- 本项目**不会**调用任何真实 AI 模型 API，也**不需要** API key。
- 计算器**不**包含：税费、免费额度、企业折扣、区域定价、延迟、模型
  质量、可靠性、速率限制。
- Token 真实用量会因 tokenizer、语言、提示词风格、服务商不同而有差异。
  你输入的「平均数」只是粗略假设，**不是**对你真实产品的测量。
- 文本 Token 估算器在浏览器里跑的是 **GPT-4 tokenizer**。Claude、
  Gemini 等服务商的 token 数可能不同；UI 已明确标注。
- 场景专属参数（RAG `topK`、Agent 调用次数、Code 上下文长度、
  Summarizer 压缩比）都是**经验默认值**，不是对你真实产品的测量。
- 当前版本**没有**建模 cache 命中率、cache 写入费用、TTL
  （`ModelPrice.cachedInputPer1M` 字段已经在数据模型里预留，UI 控件
  属于 Future Work）。
- 当前版本**没有**建模：订阅定价、毛利率、批处理折扣、区域定价。
- USD / CNY 汇率是**演示汇率**（动态拉取，固定 7.25 回退），**不是**
  金融级实时报价。
- 如果未来加入第三方聚合价格源（OpenRouter / LiteLLM 等），它们**只**
  能作为可选参考，且必须在 UI 中明确标注为第三方数据。

## 不需要 API key

核心计算器完全跑在浏览器内，不会用任何凭据调用 OpenAI、Anthropic、
Google、OpenRouter、LiteLLM 等模型或价格 API。唯一一次对外请求是
匿名拉取 `simonw/llm-prices` 的公开 JSON 快照，仅用于刷新模型列表；
如果失败，会回退到打包的静态快照，计算器继续可用。

## Future Work / 未来工作

- Cache 命中率模拟（数据模型已就位）
- 由用户输入订阅价驱动的毛利率卡片
- Embedding / Rerank 成本估算（RAG 进阶）
- 超出当前三种方案的多模型组合（planner + final answer、fallback 链等）
- 图片 / 多模态成本估算器（需先核实官方公式）
- 自动检测价格变化并在 changelog 里出 diff
- 导出 JSON / Markdown 成本报告
- 可选的 OpenRouter / LiteLLM 交叉参考数据，并明确标注为第三方

## 项目结构

```text
app/
  page.tsx          # 主页面
  layout.tsx        # 根布局
  globals.css       # Tailwind v4 入口
components/
  ScenarioPresets.tsx
  ScenarioParams.tsx
  TokenEstimator.tsx
  UsageForm.tsx
  QuickEstimateForm.tsx
  BudgetMode.tsx
  CostSummary.tsx
  CostTable.tsx
  ModelComparison.tsx
  ModelCombo.tsx
  SavingsComparison.tsx
  PricingSources.tsx
  KnownLimitations.tsx
  ShareLinkButton.tsx
  RetryRateSlider.tsx
lib/
  safeNumber.ts     # toSafeNumber / clamp01 / safeDivide
  pricing.ts        # ModelPrice + 静态回退快照
  llmPricesApi.ts   # 在线拉取 + 超时 + 回退
  scenarios.ts      # 场景 preset + 快速估算 preset
  scenarioTokens.ts # 由场景参数推导平均 input/output token
  calculate.ts      # CostReport / BudgetReport / savings / retry rate
  unitEconomics.ts
  currency.ts       # USD/CNY + 固定回退汇率
  cache.ts          # cached input price 支持
  combo.ts          # 模型组合辅助
  batch.ts
  recommendations.ts
  i18n.ts           # 中英双语文案
  urlState.ts       # URL ↔ 状态同步
scripts/
  smoke-test.ts
```

## 致谢

- 价格数据：[`simonw/llm-prices`](https://github.com/simonw/llm-prices)
  （Simon Willison，MIT）
- Tokenizer：[`js-tiktoken`](https://github.com/dqbd/tiktoken)（MIT）

## 许可

MIT
