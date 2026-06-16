import { getModelsByProvider } from "@/lib/pricing";

export function PricingSources() {
  const grouped = getModelsByProvider();
  const providers = Object.keys(grouped) as (keyof typeof grouped)[];

  return (
    <section
      aria-labelledby="sources-heading"
      className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div>
        <h2
          id="sources-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          5. Pricing sources
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          All numbers are manually collected from each provider&apos;s official
          pricing page. The &ldquo;Checked&rdquo; date is when the snapshot was
          last verified.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {providers.map((p) => (
          <div
            key={p}
            className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800"
          >
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {p}
            </h3>
            <ul className="mt-2 space-y-3">
              {grouped[p].map((m) => (
                <li key={m.model} className="space-y-1">
                  <div className="font-medium text-zinc-800 dark:text-zinc-200">
                    {m.displayName}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500">
                    Input {formatUsdShort(m.inputPer1M)} / 1M · Output{" "}
                    {formatUsdShort(m.outputPer1M)} / 1M
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500">
                    Checked: {m.checkedDate}
                  </div>
                  {m.notes ? (
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      {m.notes}
                    </div>
                  ) : null}
                  <a
                    href={m.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-xs text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                  >
                    {m.sourceUrl}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatUsdShort(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "$0";
  if (value < 1) return `$${value.toFixed(3)}`;
  return `$${value.toFixed(2)}`;
}
