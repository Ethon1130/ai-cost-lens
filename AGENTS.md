
## 一、项目概述

本项目名称为 **AI Cost Lens**。

这是一个面向技术实习生筛选项目的单页小工具，核心目标是帮助开发者在构建 AI 产品前，快速估算不同 AI API 的使用成本，并理解成本主要来自哪里。

本项目选择题目中的方向 A：

> AI 模型价格计算器：选择 2–3 个海外 AI API，做价格对比 + 用量估算页面。价格数据必须来自官方页面，并注明来源和查询日期。

本项目最终需要：

* 部署到公网；
* 提供可访问 URL；
* 提供 GitHub 公开仓库；
* 拥有真实 commit 历史；
* README 使用英文；
* 移动端不崩；
* 不提交任何 API key。

---

## 二、产品定位

AI Cost Lens 不是一个简单的价格表，而是一个 **AI 产品成本估算与决策辅助工具**。

它帮助用户回答：

1. 我的 AI 功能一个月大概要调用多少次？
2. 每次调用大概消耗多少 input / output tokens？
3. 不同模型的月成本分别是多少？
4. 哪个模型在当前场景下最便宜？
5. 如果我只有固定预算，大概能跑多少请求？
6. 当前估算有哪些不确定性和限制？

项目可以先完成 MVP，再逐步增加高级功能。

---

## 三、开发优先级

### P0：必须完成

P0 是项目能否提交的底线。

必须包含：

1. 使用场景预设；
2. 用户可输入流量和 token 假设；
3. 模型价格对比；
4. 月成本计算；
5. input / output 成本拆分；
6. 最便宜模型标记；
7. 官方价格来源和查询日期；
8. 移动端适配；
9. 英文 README；
10. Vercel 部署。

---

### P1：强烈建议完成

P1 是让项目从“普通计算器”变成“有产品感工具”的功能。

可以加入：

1. URL Query 参数同步；
2. 一键复制分享链接；
3. Budget Mode：输入预算，反推可支持请求量；
4. Copy Report：复制成本估算报告；
5. Data Freshness：价格数据新鲜度提示；
6. USD / CNY 静态汇率切换；
7. 更清晰的成本解释和风险提示。

---

### P2：可选高级功能

P2 是加分项，但不能影响 P0 稳定性。

可以考虑：

1. 文本 Token 估算器；
2. 图片 Token / 多模态成本估算器；
3. OpenRouter / LiteLLM 等聚合数据源辅助对比；
4. 更复杂的缓存命中率估算；
5. 图表可视化；
6. 导出 JSON / Markdown 报告。

如果 P2 功能实现不稳定，应暂时关闭或移到 Future Work，不要影响核心计算器。

---

## 四、技术栈

默认使用：

* Next.js
* TypeScript
* Tailwind CSS
* App Router
* Vercel

允许使用少量高价值依赖，但必须满足：

1. 依赖体积合理；
2. 不明显拖慢页面；
3. 不影响 Vercel 部署；
4. 不需要用户配置复杂环境；
5. 不引入安全风险。

不要为了“看起来高级”引入大型依赖。

---

## 五、数据源策略

### 1. 官方价格数据是主数据源

题目明确要求价格数据来自官方页面。

因此核心价格数据应以官方 pricing 页面为准，并注明：

* provider；
* model；
* source URL；
* checked date；
* notes / limitations。

---

### 2. 聚合数据源只能作为辅助

可以在后续优化中考虑 OpenRouter、LiteLLM 等聚合数据源，但必须注意：

1. 不要用它们替代题目要求的官方来源；
2. 如果使用，只能作为辅助参考或扩展功能；
3. 页面中必须明确区分“官方价格快照”和“第三方聚合来源”；
4. 不要把第三方数据伪装成官方数据；
5. 如果数据无法获取，核心计算器仍必须正常工作。

---

### 3. 不强制实时更新价格

本项目不强制实现价格自动更新。

推荐策略：

* 使用人工核对后的官方价格快照；
* 显示 checked date；
* 显示 data freshness 状态；
* 提供官方 source link；
* 在 README 中说明价格可能变化。

不要声称价格实时更新，除非确实实现并验证了稳定的数据来源。

---

## 六、安全限制

### 1. 不要提交任何密钥

禁止提交：

* OpenAI API key；
* Anthropic API key；
* Gemini API key；
* OpenRouter API key；
* Replicate API key；
* fal.ai API key；
* 任何 `.env` 中的 secret。

如果未来确实需要 API key，只能放在 Vercel Environment Variables 或本地 `.env.local`，并且 `.env.local` 必须被 `.gitignore` 忽略。

---

### 2. 不要让核心功能依赖私密 API key

核心计算器必须在没有 API key 的情况下可用。

如果某个增强功能需要 API key，它必须是可选功能，并且失败时不能影响主页面。

---

## 七、代码兜底要求

所有代码必须优先保证稳定。

### 1. 数字输入兜底

对所有用户输入进行清洗。

需要处理：

* 空字符串；
* 非数字；
* 负数；
* 小数；
* 极大值；
* 0；
* undefined；
* null。

页面中禁止出现：

* NaN；
* Infinity；
* undefined；
* null。

建议提供工具函数：

```ts
function toSafeNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return num;
}
```

---

### 2. 计算兜底

计算公式必须处理除以 0 的情况。

```ts
costPer1KRequests =
  monthlyRequests > 0 ? (totalCost / monthlyRequests) * 1000 : 0;
```

任何计算结果都必须保证是有限数字。

如计算失败，应显示 0 或友好的 fallback，而不是页面报错。

---

### 3. URL 参数兜底

如果实现 URL Query 参数同步，必须处理非法参数。

例如：

```txt
?dailyUsers=abc
?input=-100
?output=999999999999999999
```

页面不能崩。

要求：

1. URL 参数只作为初始化输入；
2. 参数非法时回退到默认 preset；
3. 不要无限循环更新 URL；
4. 不要因为 URL 过长影响页面；
5. 分享链接复制失败时显示 fallback 提示。

---

### 4. API 请求兜底

如果后续加入任何外部 API，例如汇率 API、OpenRouter、LiteLLM 或其他公开 API，必须满足：

1. 设置超时或失败处理；
2. 请求失败时使用静态 fallback 数据；
3. 页面显示“使用备用数据”提示；
4. 不让 API 失败导致主页面空白；
5. 不把外部 API 结果当作唯一数据源。

---

### 5. Token 估算兜底

如果加入文本 token 估算器：

1. tokenizer 加载失败时，使用粗略估算；
2. 粗略估算必须明确提示 approximate；
3. 文本框输入过长时限制长度；
4. 不要因为用户粘贴超长文本导致页面卡死；
5. 不要阻塞核心成本计算功能。

推荐 fallback：

```txt
Approximate token estimate: English text ≈ characters / 4, Chinese text ≈ characters / 1.5
```

---

### 6. 图片估算兜底

如果加入图片成本估算：

1. 只在已确认官方公式后实现；
2. 输入宽高必须限制范围；
3. 宽高非法时显示提示；
4. 上传图片只读取宽高，不上传服务器；
5. 不要把图片文件存储或发送到第三方；
6. 不同服务商公式不一致时，要在 UI 中说明。

---

### 7. 货币转换兜底

如果加入 USD / CNY 切换：

1. 可以先使用固定汇率；
2. 必须显示汇率来源或“fixed demo rate”；
3. 汇率 API 失败时使用静态汇率；
4. 不要把汇率结果当作金融级准确数据；
5. 页面中所有金额格式必须统一。

---

## 八、推荐计算公式

月请求量：

```ts
monthlyRequests = dailyUsers * requestsPerUserPerDay * 30;
```

月 input tokens：

```ts
monthlyInputTokens = monthlyRequests * avgInputTokens;
```

月 output tokens：

```ts
monthlyOutputTokens = monthlyRequests * avgOutputTokens;
```

input 成本：

```ts
inputCost = (monthlyInputTokens / 1_000_000) * inputPricePer1M;
```

output 成本：

```ts
outputCost = (monthlyOutputTokens / 1_000_000) * outputPricePer1M;
```

总成本：

```ts
totalCost = inputCost + outputCost;
```

每 1000 次请求成本：

```ts
costPer1KRequests =
  monthlyRequests > 0 ? (totalCost / monthlyRequests) * 1000 : 0;
```

预算模式：

```ts
costPerRequest =
  monthlyRequests > 0 ? totalCost / monthlyRequests : 0;

maxRequestsByBudget =
  costPerRequest > 0 ? Math.floor(monthlyBudget / costPerRequest) : 0;
```

---

## 九、推荐文件结构

```txt
app/
  page.tsx
  layout.tsx
  globals.css

components/
  ScenarioPresets.tsx
  UsageForm.tsx
  CostSummary.tsx
  CostTable.tsx
  PricingSources.tsx
  BudgetMode.tsx
  ShareLinkButton.tsx
  CurrencyToggle.tsx

lib/
  pricing.ts
  scenarios.ts
  calculate.ts
  freshness.ts
  safeNumber.ts
  currency.ts
  urlState.ts
```

不要求一次性创建所有文件。

先实现 P0，再逐步增加 P1 / P2。

---

## 十、UI 要求

页面要像一个干净、可信、实用的开发者工具。

推荐结构：

1. Hero；
2. 场景预设；
3. 用量输入；
4. 结果摘要；
5. 模型成本对比；
6. Budget Mode；
7. 详细成本表；
8. 价格来源；
9. Known Limitations。

移动端要求：

* 小屏幕下单列；
* 表格横向滚动；
* 数字不溢出；
* URL 不撑破页面；
* 按钮可点击；
* 输入框宽度适配；
* 不要依赖 hover 才能看到重要信息。

---

## 十一、README 要求

README 必须使用英文。

必须包含：

1. Project name；
2. Live demo link；
3. What it does；
4. Features；
5. Tech stack；
6. How to run locally；
7. Pricing data policy；
8. Known limitations；
9. No API key required；
10. Future work。

Future Work 可以写：

* URL-based sharing；
* Budget mode；
* Token estimator；
* Image cost estimator；
* Currency switch；
* OpenRouter / LiteLLM integration；
* Automated pricing change detection。

---

## 十二、Known Limitations

必须说明：

* This is an estimator, not a billing dashboard.
* Pricing data is manually collected from official provider pricing pages.
* Prices may change after the checked date.
* This project does not call real AI model APIs.
* No API key is required for the core calculator.
* The calculator does not include taxes, free tiers, enterprise discounts, regional pricing, latency, model quality, reliability, or rate limits.
* Token usage varies by tokenizer, language, and provider.
* Third-party pricing aggregators, if added, are used only as optional references.

---
## 十三、 文档生成限制

不要随意生成新的 `.md` 文档、计划文档、总结文档或说明文档。

除非用户明确要求，否则禁止创建以下文件：

* `PLAN.md`
* `TODO.md`
* `SUMMARY.md`
* `IMPLEMENTATION.md`
* `ARCHITECTURE.md`
* `NOTES.md`
* `CHANGELOG.md`
* `ROADMAP.md`
* `REPORT.md`
* `DESIGN.md`
* 任何临时计划类、复盘类、解释类 Markdown 文件

本项目不需要额外堆文档。

如果需要说明实现思路，请直接在对话中说明，不要新建文档文件。

允许保留和修改：

* `README.md`
* `AGENTS.md`
* `CLAUDE.md`

其中：

* `README.md` 是提交要求的一部分，最终必须是英文；
* `AGENTS.md` 和 `CLAUDE.md` 仅用于约束 AI 开发行为；
* 不要再创建新的规则文档或计划文档。

开发时优先修改代码文件，而不是生成解释性文档。

每次实现功能后，只需要在对话里简要说明：

1. 改了哪些文件；
2. 实现了什么；
3. 做了哪些兜底；
4. 如何测试。

不要把这些说明写入新的 `.md` 文件。


---

## 十四、Git 操作限制

Git 由用户本人手动管理，AI Agent 不允许执行任何 Git 操作。

禁止 AI 执行或建议自动执行以下命令：

```bash
git add
git commit
git push
git pull
git merge
git rebase
git reset
git checkout
git switch
git branch
git remote
git tag
git stash
```

AI 不得：

1. 自动提交代码；
2. 自动推送到远程仓库；
3. 自动创建、切换、删除分支；
4. 自动合并分支；
5. 自动回滚代码；
6. 自动修改 Git remote；
7. 自动修改 commit 历史；
8. 自动执行 rebase / reset / force push；
9. 自动创建 tag；
10. 自动 stash 用户修改。

AI 可以做的事情：

1. 修改项目代码；
2. 说明建议的 commit message；
3. 提醒用户当前阶段适合提交一次；
4. 在对话中列出建议提交的文件；
5. 说明为什么此时适合提交。

但是最终 Git 操作必须由用户自己手动执行。

如果需要提交，AI 只能提示：

```txt
建议你现在手动提交一次，commit message 可以写：
"implement core cost calculation"
```

不要直接运行任何 Git 命令。

如果 AI 需要了解当前文件状态，应先询问用户或让用户自行提供，不要主动执行 Git 状态、提交、推送相关命令。


## 十五、开发原则

优先级：

1. 不崩；
2. 能跑；
3. 能部署；
4. 计算正确；
5. 数据来源清楚；
6. 移动端正常；
7. 代码结构清楚；
8. 有产品亮点；
9. 再考虑高级功能。

如果某个高级功能会影响稳定性，宁愿不做。

每次修改后，请说明：

1. 修改了哪些文件；
2. 实现了什么；
3. 有哪些兜底；
4. 如何测试。

