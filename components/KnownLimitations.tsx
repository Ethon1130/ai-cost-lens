export function KnownLimitations() {
  return (
    <section
      aria-labelledby="limitations-heading"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
    >
      <h2
        id="limitations-heading"
        className="text-base font-semibold"
      >
        Known limitations
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>This is an estimator, not a billing dashboard.</li>
        <li>
          Pricing data is manually collected from official provider pricing
          pages and may change after the checked date.
        </li>
        <li>This project does not call real AI model APIs.</li>
        <li>No API key is required for the core calculator.</li>
        <li>
          The calculator does not include taxes, free tiers, enterprise
          discounts, regional pricing, latency, model quality, reliability, or
          rate limits.
        </li>
        <li>
          Token usage varies by tokenizer, language, and provider; the average
          numbers you enter are rough assumptions.
        </li>
        <li>
          Scenario-specific parameters such as RAG chunks and Agent calls are
          educated defaults, not measurements of your real product.
        </li>
        <li>
          Cache hit rate, cache write cost, TTL, subscriptions, taxes, and
          regional pricing are not included in this P0 calculator.
        </li>
        <li>
          Third-party pricing aggregators (e.g. OpenRouter, LiteLLM) are not
          used as a data source.
        </li>
      </ul>
    </section>
  );
}
