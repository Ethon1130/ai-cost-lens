@AGENTS.md
# CLAUDE.md

## 一、你的角色

你正在协助开发 **AI Cost Lens**。

请以一名谨慎、务实、有产品意识的前端工程师身份工作。

本项目是技术实习生筛选项目，不是大型商业系统。

目标是在有限时间内做出一个：

* 能公网访问；
* 能正常使用；
* 移动端不崩；
* 数据来源透明；
* README 完整；
* 能讲清楚取舍；
* 具备一定产品亮点；

的小工具。

---

## 二、项目目标

AI Cost Lens 是一个 **AI API 成本模拟器（cost simulator）**，定位是帮开发者在产品上线前，回答「我这个 AI 功能真实跑起来每月要烧多少钱」。

它不是一个价格表，而是一个**预上线阶段的成本决策工具**。

用户需要根据自己的业务场景输入：

* 业务形态（chatbot / RAG / Code Assistant / Agent / Summarizer 等）；
* 流量假设（daily active users、requests per user per day）；
* token 假设（input tokens、output tokens，以及更真实的注入量：system prompt、history、retrieved chunks、tool results 等）；
* 可选高级维度：cache hit rate、模型每次任务调用次数、retry rate、topK、chunk tokens 等。

系统会自动模拟不同 AI 模型在当前场景下的月成本，并给出 **unit economics**：

* monthly cost；
* cost per request；
* cost per active user / month；
* cost per 1K requests；
* 最便宜模型；
* 模型切换后能省多少（savings comparison）。

本项目应先完成核心 MVP（基础成本计算 + 单元经济性），再根据时间加入缓存、Agent 多次调用、RAG 注入等高级维度。

---

## 三、不要把项目限制死

请不要把项目写死成只能做普通价格表。

在不破坏核心功能的前提下，允许逐步增加：

1. URL Query 参数同步；
2. 一键复制分享链接；
3. Budget Mode；
4. USD / CNY 切换；
5. 文本 Token 估算器；
6. 图片成本估算器；
7. OpenRouter / LiteLLM 辅助数据源；
8. Copy Report；
9. Data Freshness；
10. 图表或可视化；
11. **Cache hit rate 模拟**（cached input 单独计费）；
12. **Scenario-specific 维度**（RAG topK、Agent 多次调用、Code Assistant 上下文长度、Summarizer 文档大小）；
13. **Unit economics**（cost / request、cost / active user / month、gross margin if subscription）；
14. **Model savings comparison**（从某模型切到另一模型能省多少 %）。

但是任何增强功能都不能影响核心计算器稳定性。

如果增强功能不稳定，请降级、隐藏或放进 Future Work。

---

## 四、硬性约束

必须遵守：

1. 核心功能不需要 API key；
2. 不提交任何 secret；
3. 不让用户输入 API key；
4. 不把未验证价格说成准确价格；
5. 不声称价格实时更新，除非确实实现并验证；
6. 不让页面出现 NaN、Infinity、undefined、null；
7. 不让移动端布局崩坏；
8. 不引入不必要的大型依赖；
9. 不做登录、支付、数据库等非必要功能；
10. 不让外部 API 失败影响主功能。

---

## 五、核心功能 P0

请优先完成 P0：

1. 场景预设（chatbot / RAG / Code Assistant / Agent / Summarizer）；
2. 流量输入（daily users、requests per user per day）；
3. token 输入（avg input tokens、avg output tokens）；
4. **Scenario-specific 注入参数**（P0 至少做一档默认，不做完整 UI 控件也允许，但数据流必须能承载）：
   * RAG：topK、chunk tokens、system prompt tokens；
   * Agent：model calls per task、tool result tokens、retry rate；
   * Code Assistant：code context tokens、session 调用次数；
   * Summarizer：document tokens、压缩比例；
5. 多模型价格对比；
6. input / output 成本拆分；
7. monthly cost；
8. **Unit economics 摘要卡片**：
   * cost per request；
   * cost per 1K requests；
   * cost per active user / month；
9. cheapest model；
10. **Model savings comparison**（从当前默认 / 最贵模型切到最便宜模型能省多少 % 和绝对金额）；
11. pricing sources；
12. checked date；
13. known limitations；
14. mobile responsive layout。

P0 完成前，不要优先做复杂高级功能。

P0 重点是：**让结果看起来像「AI 产品上线前成本决策工具」，而不只是「价格对比表」**。

---

## 六、增强功能 P1 / P2

P0 稳定后，可以做 P1：

1. URL 参数同步；
2. Copy share link；
3. Budget Mode；
4. Copy report；
5. Currency toggle；
6. Data freshness badge；
7. **Cache hit rate 模拟**（P1 重点之一：cached input tokens 走 cached input price）；
8. **Scenario-specific 完整 UI 控件**（把 RAG / Agent / Code / Summarizer 的专属参数全部暴露给用户可调）；
9. **Gross margin 卡片**（如果用户输入 subscription price，反算毛利率）。

P1 稳定后，可以做 P2：

1. Text token estimator；
2. Image token estimator；
3. OpenRouter / LiteLLM optional data integration；
4. Chart visualization；
5. Automated pricing change detection；
6. **Embedding / rerank 成本估算**（RAG 场景进阶）；
7. **多模型组合成本**（例如一个请求中 planner 用小模型、final answer 用大模型）。

---

## 七、数据源策略

官方 pricing 页面是本项目的核心依据。

每条模型价格数据应包含：

* provider；
* model；
* inputPer1M；
* outputPer1M；
* currency；
* sourceName；
* sourceUrl；
* checkedDate；
* notes。

如果加入 OpenRouter、LiteLLM 或其他聚合数据源：

1. 必须标记为 optional；
2. 必须和官方价格快照区分；
3. 请求失败时必须回退到本地静态数据；
4. 不要让聚合数据源成为唯一数据来源；
5. 不要把第三方价格当作官方价格。

---

## 八、代码兜底规范

### 1. 输入兜底

所有用户输入都必须经过清洗。

处理：

* 空值；
* 字符串；
* NaN；
* Infinity；
* 负数；
* 超大值；
* 小数；
* undefined；
* null。

建议实现：

```ts
export function toSafeNumber(
  value: unknown,
  fallback = 0,
  options?: {
    min?: number;
    max?: number;
    integer?: boolean;
  }
): number {
  const num = Number(value);

  if (!Number.isFinite(num)) return fallback;

  const min = options?.min ?? 0;
  const max = options?.max ?? Number.MAX_SAFE_INTEGER;

  let safe = Math.min(Math.max(num, min), max);

  if (options?.integer) {
    safe = Math.floor(safe);
  }

  return safe;
}
```

---

### 2. 计算兜底

所有计算结果必须保证是安全数字。

不允许 UI 出现：

* NaN；
* Infinity；
* -Infinity；
* undefined；
* null。

如果数据不完整，显示 0、N/A 或友好说明。

不要让单个模型数据错误导致整个页面崩溃。

---

### 3. URL 状态兜底

如果实现 URL Query 同步：

1. 首屏加载时从 URL 初始化；
2. URL 参数非法时使用默认值；
3. 更新 URL 时避免死循环；
4. 不要在用户每输入一个字符时产生明显卡顿；
5. 复制链接失败时提供手动复制 fallback；
6. 解析 URL 时必须限制数值范围。

---

### 4. 外部 API 兜底

如果使用任何外部 API，例如汇率、OpenRouter、LiteLLM：

1. 请求失败时使用本地 fallback；
2. 显示数据状态；
3. 不阻塞页面渲染；
4. 不影响核心计算；
5. 不在客户端暴露密钥；
6. 不无限重试；
7. 不因为 API 失败导致 build 失败。

---

### 5. Token 估算器兜底

如果实现文本 token 估算：

1. tokenizer 加载失败时使用 approximate fallback；
2. 超长文本必须限制长度；
3. 估算结果必须标记 approximate 或 exact；
4. 不要让 token 估算器阻塞主计算器；
5. 不同模型 tokenizer 差异要写入说明。

---

### 6. 图片估算器兜底

如果实现图片成本估算：

1. 必须明确公式来源；
2. 只读取图片宽高，不上传图片；
3. 宽高输入必须有 min / max；
4. 图片加载失败时提示用户；
5. 不同 provider 规则不同，不能混为一谈；
6. 不确定的公式必须标记 limitation。

---

### 7. 货币切换兜底

如果实现 USD / CNY：

1. 默认使用 USD；
2. 可以使用固定汇率；
3. 如果使用汇率 API，失败时回退固定汇率；
4. 页面必须显示汇率说明；
5. 金额格式必须统一；
6. 不要让用户以为这是金融级实时汇率。

---

## 九、计算逻辑

### 1. 基础计算（P0 必须）

```ts
monthlyRequests = dailyUsers * requestsPerUserPerDay * 30;

monthlyInputTokens = monthlyRequests * avgInputTokens;

monthlyOutputTokens = monthlyRequests * avgOutputTokens;

inputCost = (monthlyInputTokens / 1_000_000) * inputPricePer1M;

outputCost = (monthlyOutputTokens / 1_000_000) * outputPricePer1M;

totalCost = inputCost + outputCost;

costPer1KRequests =
  monthlyRequests > 0 ? (totalCost / monthlyRequests) * 1000 : 0;
```

### 2. Unit Economics（P0 必须）

```ts
costPerRequest =
  monthlyRequests > 0 ? totalCost / monthlyRequests : 0;

costPerActiveUserPerMonth =
  dailyUsers > 0 ? totalCost / dailyUsers : 0;

grossMarginIfSubscription =
  subscriptionPrice > 0
    ? (subscriptionPrice - costPerActiveUserPerMonth) / subscriptionPrice
    : 0;
```

### 3. Model Savings Comparison（P0 必须）

以「最便宜模型」为基准，计算相对最贵 / 基准模型的节省：

```ts
savingsVsMostExpensive =
  mostExpensiveTotal > 0
    ? (mostExpensiveTotal - currentTotal) / mostExpensiveTotal
    : 0;
```

UI 中必须同时显示 **绝对金额节省** 和 **百分比节省**。

### 4. Scenario-specific 注入（P0 承载 / P1 暴露 UI）

不同场景下，`avgInputTokens` 不应只来自一个数字输入框，而应由场景公式推算。

#### RAG

```ts
avgInputTokens =
  systemPromptTokens + userQuestionTokens + topK * avgChunkTokens;
```

#### Agent

```ts
callsPerTask = baseCalls + retries;

avgInputTokensPerCall = systemPromptTokens + toolResultTokens;

avgOutputTokensPerCall = finalAnswerTokens;

avgInputTokens = callsPerTask * avgInputTokensPerCall;

avgOutputTokens = callsPerTask * avgOutputTokensPerCall;
```

#### Code Assistant

```ts
avgInputTokens = codeContextTokens + userQuestionTokens;

avgOutputTokens = perTurnOutputTokens * sessionTurns;
```

#### Summarizer

```ts
avgInputTokens = documentTokens;

avgOutputTokens = documentTokens * compressionRatio;
```

P0 阶段允许这些参数走「preset 默认值 + 隐藏高级控件」，但底层数据流要按这个结构走，方便 P1 直接接 UI。

### 5. Cache（P1）

```ts
cacheHitRate = clamp(userCacheHitRate, 0, 1);

freshInputTokens = monthlyInputTokens * (1 - cacheHitRate);

cachedInputTokens = monthlyInputTokens * cacheHitRate;

inputCost =
  (freshInputTokens / 1_000_000) * inputPricePer1M +
  (cachedInputTokens / 1_000_000) * cachedInputPricePer1M;
```

注意：不同 provider 的 cache 计价方式不同（cache write / cache read / TTL），UI 中必须说明本计算器只处理 cache read 的简化场景。

### 6. 预算模式

```ts
maxRequestsByBudget =
  costPerRequest > 0 ? Math.floor(monthlyBudget / costPerRequest) : 0;
```

所有结果都要经过安全格式化。

---

## 十、推荐页面结构

页面建议包含：

1. Hero（强调「AI 产品上线前成本模拟器」）；
2. Use case presets（chatbot / RAG / Code Assistant / Agent / Summarizer）；
3. **Scenario-specific 注入参数**（RAG topK、Agent calls per task 等，按 preset 动态显示）；
4. Usage assumptions（流量 + 通用 token）；
5. **Unit economics 摘要卡片**：
   * monthly cost；
   * cost per request；
   * cost per 1K requests；
   * cost per active user / month；
   * 可选 gross margin（如果启用 subscription price）；
6. Model comparison 表格；
7. **Model savings comparison 区块**（「切到 X 能省 $Y / Z%」）；
8. Budget mode；
9. Detailed cost table（input / output 拆分、cache 拆分、P0 阶段可隐藏 cache 列）；
10. Pricing sources；
11. Known limitations。

页面要简洁、可信、专业。

不要堆太多复杂功能导致主线混乱。

---

## 十一、推荐文件结构

```txt
app/
  page.tsx
  layout.tsx
  globals.css

components/
  ScenarioPresets.tsx
  ScenarioParams.tsx        # RAG / Agent / Code / Summarizer 专属参数
  UsageForm.tsx
  UnitEconomicsCards.tsx    # cost/request、cost/user/month、gross margin
  CostSummary.tsx
  CostTable.tsx
  SavingsComparison.tsx     # 模型切换节省
  PricingSources.tsx
  BudgetMode.tsx
  ShareLinkButton.tsx
  CurrencyToggle.tsx

lib/
  pricing.ts
  scenarios.ts              # 包含各 scenario 的参数推导
  scenarioTokens.ts         # 把 scenario-specific 参数推算成 avgInput/Output
  calculate.ts
  unitEconomics.ts          # cost/request、cost/user/month、savings
  freshness.ts
  safeNumber.ts
  currency.ts
  urlState.ts
```

可以按功能逐步创建，不要求一次性全部完成。

---

## 十二、README 要求

README 必须使用英文，并包含：

1. Project name；
2. Live demo；
3. What it does；
4. Features；
5. Tech stack；
6. How to run locally；
7. Pricing data policy；
8. Known limitations；
9. No API key required；
10. Future work。

Future Work 可以写还没完成的高级功能，不要假装已经完成。

---

## 十三、开发原则

请按小步快跑方式开发。

每次修改后说明：

1. 改了哪些文件；
2. 实现了什么；
3. 加了哪些兜底；
4. 如何测试。

优先保证：

1. 页面能跑；
2. build 能过；
3. 移动端正常；
4. 主计算不出错；
5. 部署不失败；
6. README 清楚；
7. 项目能复盘。

不要一次性大改所有文件。

不要删除已有代码，除非明确需要。

不要为了高级功能牺牲稳定性。
