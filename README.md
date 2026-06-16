# AI Cost Lens

Estimate monthly AI API cost before you ship.

AI Cost Lens is a small, dependency-light single-page tool for indie developers
and programmers who are about to build an AI feature. Pick a project shape,
tweak the usage numbers, and see the monthly cost across official OpenAI,
Anthropic, and Google pricing snapshots — all in your browser, with no account
and no API key.

## Live demo

Deployed on Vercel: <https://ai-cost-lens.vercel.app> (placeholder — replace
with the real URL after the first deploy).

## What it does

- **Scenario presets** for common AI product shapes: AI Chatbot MVP, RAG
  Knowledge Base, Code Assistant, AI Agent Workflow, Document Summarizer.
- **Live cost calculation** based on your inputs: daily users, requests per
  user per day, average input tokens, average output tokens.
- **Side-by-side comparison** of 6 models (OpenAI, Anthropic, Google) with
  input / output / total monthly cost and cost per 1k requests.
- **Cheapest model** is highlighted automatically.
- **Clear data provenance**: every price links to its official pricing page
  with a `checkedDate`.

## Features

- 5 scenario presets, fully editable usage inputs
- 6 models across 3 providers (OpenAI / Anthropic / Google)
- Cheapest-model highlighting
- Per-model input vs output cost split
- Cost per 1k requests column
- Mobile-friendly layout (single column, scrollable table, large tap targets)
- Static, dependency-light (no state libraries, no API clients)
- No external network calls after the initial page load

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) (strict mode)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Hosted on [Vercel](https://vercel.com/)

## How to run locally

Requires Node.js 20 or newer (this project was verified on Node 22).

```bash
# install dependencies
npm install

# start dev server
npm run dev
# open http://localhost:3000

# production build
npm run build
npm start

# type-check only
npx tsc --noEmit

# lint
npm run lint
```

No environment variables are required to run the calculator.

## Pricing data policy

- Prices live in [`lib/pricing.ts`](lib/pricing.ts) as a manual snapshot.
- Each model records `sourceUrl` (the official pricing page) and `checkedDate`
  (the day the snapshot was last verified).
- Snapshot is not automatically refreshed. Prices may change after the checked
  date — always verify on the linked official page before making a decision.
- Third-party aggregators (OpenRouter, LiteLLM, etc.) are **not** used as a
  data source for the calculator. They may only appear in future work as
  optional reference material, and would be clearly labeled as such.

## Known limitations

- This is an estimator, not a billing dashboard.
- Pricing data is manually collected from official provider pricing pages.
- Prices may change after the `checkedDate`.
- This project does not call real AI model APIs.
- No API key is required for the core calculator.
- The calculator does not include taxes, free tiers, enterprise discounts,
  regional pricing, latency, model quality, reliability, or rate limits.
- Token usage varies by tokenizer, language, and provider; the averages you
  enter are rough assumptions.

## No API key required

The core calculator runs entirely in the browser. There is no server-side
API call, no proxy, and no key of any kind. This makes the app safe to deploy
publicly and safe to share.

## Future work

- URL-based sharing of the current scenario + usage
- Copy-link button
- Budget mode (reverse-solve max requests from a fixed budget)
- Data freshness indicator (Fresh / OK / Stale badge)
- USD / CNY toggle (with a fixed demo rate and clear labeling)
- Copy-as-report (plain-text / Markdown summary)
- Image and multimodal cost estimator
- Token estimator (real tokenizer when feasible, with rough fallback)
- OpenRouter / LiteLLM aggregator as an optional reference source

## Project structure

```text
app/
  page.tsx          # Client component, composes the whole page
  layout.tsx        # Root layout, metadata, fonts
  globals.css       # Tailwind entry + small global tweaks
components/
  ScenarioPresets.tsx
  UsageForm.tsx
  CostSummary.tsx
  CostTable.tsx
  PricingSources.tsx
  KnownLimitations.tsx
lib/
  safeNumber.ts     # Input sanitization + safe divide
  pricing.ts        # Manual model price snapshot
  calculate.ts      # Monthly request / cost formulas
  scenarios.ts      # 5 preset scenarios
```

## License

MIT.
