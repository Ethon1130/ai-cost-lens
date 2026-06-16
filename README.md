# AI Cost Lens

AI Cost Lens is an AI API cost simulator for early-stage AI products. It helps
developers estimate how much a planned AI feature might cost per month before
shipping it.

The project is intentionally small and dependency-light: no account, no API key,
no server-side model calls, and no external pricing API.

## Live demo

Deployed on Vercel: <https://ai-cost-lens.vercel.app> (placeholder; replace
with the real URL after deployment).

## What it does

- Starts from common product scenarios: AI Chatbot MVP, RAG Knowledge Base, Code
  Assistant, AI Agent Workflow, and Document Summarizer.
- Lets you tune scenario-specific token assumptions such as RAG `topK`, chunk
  size, Agent calls per task, code context length, and summarizer compression
  ratio.
- Includes a local GPT tokenizer text estimator so you can paste real prompts,
  code, documents, or tool results before applying the count to the active
  scenario.
- Computes monthly requests, monthly input tokens, monthly output tokens, input
  cost, output cost, and total monthly cost.
- Compares 6 models across OpenAI, Anthropic, and Google using manually checked
  official pricing snapshots.
- Highlights the cheapest model for the current assumptions.
- Shows unit economics: monthly cost, cost per request, cost per 1K requests,
  and optional cost per active user per month.
- Shows estimated savings when switching from the highest-cost model in the
  snapshot to the cheapest model.
- Lists official pricing source URLs and checked dates.

## Features

- Scenario-specific cost modeling instead of a plain price table
- Editable API usage assumptions: requests per day and billable days per month
- Optional active-user input for product economics, without changing token cost
- Editable scenario assumptions for chatbot, RAG, agent, code assistant, and
  summarizer workflows
- OpenAI/GPT text token estimator powered by `js-tiktoken`
- One-click application from the text estimator into the current scenario's
  most relevant token field
- Safe numeric input handling for empty, invalid, negative, and extreme values
- Input/output cost split per model
- Unit economics summary
- Model savings comparison
- Chinese / English language toggle
- Day / night display mode toggle
- Mobile-friendly layout with scrollable comparison tables
- Fully local browser calculation with no API key required

## Tech stack

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Vercel-ready static deployment

## How to run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Useful checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

No environment variables are required.

## Pricing data policy

- Pricing data lives in `lib/pricing.ts` as a manual snapshot.
- Every model includes provider, model name, input price per 1M tokens, output
  price per 1M tokens, official source URL, checked date, and notes.
- Prices are not refreshed in real time.
- Prices may change after the checked date.
- Always verify the latest price on the linked official provider page before
  making a real product or budget decision.
- Third-party aggregators such as OpenRouter or LiteLLM are not used as primary
  pricing sources.

## Known limitations

- This is an estimator / cost simulator, not a billing dashboard.
- Pricing data is manually collected from official provider pricing pages.
- Prices may change after the checked date.
- This project does not call real AI model APIs.
- No API key is required for the core calculator.
- The calculator does not include taxes, free tiers, enterprise discounts,
  regional pricing, latency, model quality, reliability, or rate limits.
- Token usage varies by tokenizer, language, provider, prompt style, and product
  behavior.
- The text token estimator uses an OpenAI/GPT tokenizer in the browser. Claude,
  Gemini, and other providers may count the same text differently.
- Scenario-specific parameters such as RAG `topK`, Agent calls per task, code
  context size, and summarizer compression ratio are educated defaults, not
  measurements of your real product.
- Cache hit rate is not included in the P0 calculator.
- Unit economics are computed from user-input assumptions and do not reflect
  real revenue or billing data.
- Third-party pricing aggregators, if added later, should only be optional
  references and must be clearly labeled.

## No API key required

The core calculator runs entirely in the browser. It does not call OpenAI,
Anthropic, Google, OpenRouter, LiteLLM, or any other model or pricing API.

## Future work

- URL-based sharing
- Copy share link
- Budget mode
- Cache hit rate simulation
- Gross margin with subscription-price input
- Copy Markdown report
- Data freshness badge
- USD / CNY toggle with a fixed demo rate
- Image and multimodal cost estimator
- Embedding and rerank cost estimation
- Optional OpenRouter / LiteLLM reference data
- Multi-model composition, such as planner plus final answer models
- Export JSON / Markdown report
- Automated pricing change detection

## Project structure

```text
app/
  page.tsx
  layout.tsx
  globals.css
components/
  ScenarioPresets.tsx
  ScenarioParams.tsx
  TokenEstimator.tsx
  UsageForm.tsx
  CostSummary.tsx
  SavingsComparison.tsx
  CostTable.tsx
  PricingSources.tsx
  KnownLimitations.tsx
lib/
  safeNumber.ts
  pricing.ts
  i18n.ts
  scenarios.ts
  scenarioTokens.ts
  calculate.ts
scripts/
  smoke-test.ts
```

## License

MIT.
