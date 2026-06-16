import { SCENARIOS } from "@/lib/scenarios";
import type { AppCopy } from "@/lib/i18n";

interface ScenarioPresetsProps {
  activeId: string;
  copy: AppCopy["scenarios"];
  onSelect: (id: string) => void;
}

export function ScenarioPresets({
  activeId,
  copy,
  onSelect,
}: ScenarioPresetsProps) {
  return (
    <section aria-labelledby="scenarios-heading" className="space-y-3">
      <div>
        <h2
          id="scenarios-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {copy.heading}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {copy.description}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((s) => {
          const isActive = s.id === activeId;
          const itemCopy = copy.items[s.id] ?? {
            title: s.title,
            description: s.description,
          };
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              aria-pressed={isActive}
              className={[
                "min-h-[88px] rounded-xl border p-4 text-left transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-900",
                isActive
                  ? "border-zinc-900 bg-zinc-900/[0.04] text-zinc-900 dark:border-zinc-100 dark:bg-white/[0.06] dark:text-zinc-100"
                  : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-900/[0.03] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-white/[0.04]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{itemCopy.title}</span>
                {isActive ? (
                  <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {copy.active}
                  </span>
                ) : null}
              </div>
              <p
                className={[
                  "mt-1 text-xs leading-relaxed",
                  isActive
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "text-zinc-600 dark:text-zinc-400",
                ].join(" ")}
              >
                {itemCopy.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
