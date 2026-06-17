# AI Cost Lens

> An AI API cost simulator for early-stage AI products.
> Pick a product scenario, tune the token assumptions, and see the monthly bill
> across OpenAI, Anthropic, and Google before you ship.

- [English](./README.md) | [简体中文](./README.zh-CN.md)
- No account, no API key, no backend calls to real models.
- The calculator runs entirely in your browser.

## Live demo

Deployed on Vercel: <https://ai-cost-lens.vercel.app>

> If the link is not live yet, run it locally with the steps in
> [How to run locally](#how-to-run-locally).

## What it does

AI Cost Lens helps you answer one question before shipping an AI feature:

> "If I launch this, how much will it cost me per month, and which model
> should I pick?"

It is not a price table. It is a cost simulator that:

- starts from common product scenarios (AI Chatbot MVP, RAG Knowledge Base,
  Code Assistant, AI Agent Workflow, Document Summarizer);
- derives average input / output tokens from scenario-specific parameters
  (RAG `topK` × chunk tokens, Agent base calls + retries, code context
  length, summarizer compression ratio, etc.);
- lets you paste real text, code, or a document and count tokens locally
  with a GPT tokenizer, then push the count into the active scenario;
- compares monthly cost, cost per request, cost per 1K requests, and cost
  per active user per month across every model in the snapshot;
- highlights the cheapest model and the estimated savings versus the
  most expensive model;
- includes a Budget Mode that reverses the question: given a fixed monthly
  AI budget, how many requests can each model support;
- shows three model-combo strategies (all-high, router, batch) for the same
  traffic so you can plan routing, not just pick one model.

## Features

- **Scenario-aware cost modeling** for Chatbot, RAG, Code Assistant, Agent,
  and Summarizer — not a flat price table.
- **Quick Estimate** mode for non-token-savvy users: pick a use case and a
  length tier (Simple chat / Deep research / Full codebase / etc.).
- **Advanced Setup** mode for power users: tune every scenario parameter.
- **Local text token estimator** powered by `js-tiktoken` (GPT-4 tokenizer
  in the browser), with one-click apply into the relevant token field.
- **Unit economics summary**: monthly cost, cost per request, cost per 1K
  requests, cost per active user per month.
- **Model savings comparison** (absolute USD and percent) versus the most
  expensive model in the snapshot.
- **Budget Mode** with per-model request-runway ranking.
- **Model combo recommendations** (all-high / router / batch) with
  realistic caveats.
- **USD / CNY currency toggle** with a demo FX rate (live fetch with
  7.25 fallback).
- **Chinese / English language toggle** and **day / night display mode**.
- **Share link** that encodes the current scenario and assumptions in the
  URL.
- **Mobile-friendly layout** with horizontally scrollable comparison
  tables.
- **Safe numeric input** for empty, invalid, negative, or extreme values.
  No `NaN`, `Infinity`, `undefined`, or `null` ever appears in the UI.
- **Local pricing fallback** if the live pricing API is unreachable.

## Tech stack

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [`js-tiktoken`](https://github.com/dqbd/tiktoken) for in-browser GPT
  tokenization
- Pricing data: [simonw/llm-prices](https://github.com/simonw/llm-prices)
  (open-source, MIT)
- Vercel-ready static deployment

## How to run locally

Requires **Node.js 20 or newer**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Other useful scripts:

```bash
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript type check
npm run build     # Production build
npm run start     # Run the production build
```

No environment variables are required. The pricing API call is made from the
browser at runtime; if it fails, the bundled fallback snapshot in
`lib/pricing.ts` is used.

## Pricing data policy

- The default snapshot is fetched live from
  [`simonw/llm-prices`](https://github.com/simonw/llm-prices)
  (`current-v1.json`).
- A static fallback list of 6 models (OpenAI GPT-4o / GPT-4o-mini,
  Anthropic Claude 3.5 Haiku / Sonnet, Google Gemini 1.5 Flash / Pro) is
  bundled in `lib/pricing.ts` and used automatically when the API is
  unavailable.
- Every model carries: provider, model id, display name, input price per
  1M tokens, output price per 1M tokens, official source URL, checked
  date, and an optional note.
- Prices may change at any time. Always verify the latest price on each
  provider's official pricing page before making a real product or
  budget decision.
- The app does not claim real-time accuracy; it labels the data source
  ("Live" / "Local" / "cached") in the **Pricing sources** table.

## Known limitations

- This is an estimator / cost simulator, **not** a billing dashboard.
- The project does not call any real AI model API and does not require an
  API key.
- The calculator does **not** include taxes, free tiers, enterprise
  discounts, regional pricing, latency, model quality, reliability, or
  rate limits.
- Token usage varies by tokenizer, language, prompt style, and provider.
  The average numbers you enter are rough assumptions, not measurements of
  your real product.
- The text token estimator uses the **GPT-4 tokenizer** in the browser.
  Claude, Gemini, and other providers may count the same text differently;
  the UI labels this clearly.
- Scenario-specific parameters (RAG `topK`, Agent calls per task, code
  context length, summarizer compression ratio) are **educated defaults**,
  not measurements.
- **Cache hit rate**, cache write cost, and TTL are **not** modeled in the
  current version (the data model and `ModelPrice.cachedInputPer1M` field
  are in place; the UI control is future work).
- **Subscription pricing**, gross margin, batch discount, and regional
  pricing are **not** included in the unit-economics view.
- The USD / CNY exchange rate is a **demo rate** (live fetch with a fixed
  7.25 fallback). It is **not** a financial-grade FX quote.
- Third-party pricing aggregators, if added later, will only be optional
  references and must be clearly labeled as such.

## No API key required

The core calculator runs entirely in the browser. It does not call OpenAI,
Anthropic, Google, OpenRouter, LiteLLM, or any other model or pricing API
with credentials. The only outbound request is the public, unauthenticated
fetch of the `simonw/llm-prices` JSON snapshot, which is used only to
refresh the model list; if it fails, the bundled fallback keeps the
calculator working.

## Future work

- Cache hit rate simulation (the data model is already in place).
- Gross margin card driven by a user-entered subscription price.
- Embedding and rerank cost estimation (RAG advanced).
- Multi-model composition beyond the current three schemes
  (planner + final answer, fallback chain, etc.).
- Image and multimodal cost estimator (requires verified official formulas).
- Automated pricing change detection with diffs in the changelog.
- Export a JSON or Markdown cost report.
- Optional OpenRouter / LiteLLM cross-reference data, clearly labeled
  as third-party.

## Project structure

```text
app/
  page.tsx          # main page
  layout.tsx        # root layout
  globals.css       # Tailwind v4 entry
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
  pricing.ts        # ModelPrice + static fallback snapshot
  llmPricesApi.ts   # live fetch with timeout + fallback
  scenarios.ts      # scenario presets + quick-estimate presets
  scenarioTokens.ts # derive avg input/output tokens from params
  calculate.ts      # CostReport, BudgetReport, savings, retry rate
  unitEconomics.ts
  currency.ts       # USD/CNY + fixed fallback rate
  cache.ts          # cached input price support
  combo.ts          # model combo helpers
  batch.ts
  recommendations.ts
  i18n.ts           # EN/ZH copy
  urlState.ts       # URL ↔ state sync
scripts/
  smoke-test.ts
```

## Acknowledgements

- Pricing data: [`simonw/llm-prices`](https://github.com/simonw/llm-prices)
  by Simon Willison, MIT licensed.
- Tokenization: [`js-tiktoken`](https://github.com/dqbd/tiktoken), MIT
  licensed.

## License

MIT
