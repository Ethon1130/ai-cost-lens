import { SCENARIOS } from "@/lib/scenarios";

interface ScenarioPresetsProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export function ScenarioPresets({ activeId, onSelect }: ScenarioPresetsProps) {
  return (
    <section aria-labelledby="scenarios-heading" className="space-y-3">
      <div>
        <h2
          id="scenarios-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          1. Pick a scenario
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Starting presets for common AI project shapes. Tweak the numbers in step
          2 afterwards.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              aria-pressed={isActive}
              className={[
                "min-h-[88px] rounded-xl border p-4 text-left transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:focus:ring-zinc-100 dark:focus:ring-offset-zinc-900",
                isActive
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-600",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{s.title}</span>
                {isActive ? (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white dark:bg-zinc-900/20 dark:text-zinc-900">
                    Active
                  </span>
                ) : null}
              </div>
              <p
                className={[
                  "mt-1 text-xs leading-relaxed",
                  isActive
                    ? "text-zinc-100 dark:text-zinc-800"
                    : "text-zinc-600 dark:text-zinc-400",
                ].join(" ")}
              >
                {s.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
