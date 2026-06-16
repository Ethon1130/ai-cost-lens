import type { AppCopy } from "@/lib/i18n";

interface KnownLimitationsProps {
  copy: AppCopy["limitations"];
}

export function KnownLimitations({ copy }: KnownLimitationsProps) {
  return (
    <section
      aria-labelledby="limitations-heading"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
    >
      <h2
        id="limitations-heading"
        className="text-base font-semibold"
      >
        {copy.heading}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {copy.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
