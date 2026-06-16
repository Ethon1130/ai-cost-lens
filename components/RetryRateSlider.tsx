interface RetryRateSliderProps {
  value: number;
  onChange: (value: number) => void;
  copy: {
    label: string;
    hint: string;
  };
}

export function RetryRateSlider({ value, onChange, copy }: RetryRateSliderProps) {
  const displayPercent = Math.round((value ?? 0) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor="field-retryRate"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          {copy.label}
        </label>
        <span className="text-sm font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
          {displayPercent}%
        </span>
      </div>
      <input
        id="field-retryRate"
        type="range"
        min={0}
        max={100}
        step={1}
        value={displayPercent}
        onChange={(e) => {
          const pct = Number.parseInt(e.target.value, 10);
          onChange(pct / 100);
        }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 dark:bg-zinc-800"
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-500">{copy.hint}</p>
    </div>
  );
}
