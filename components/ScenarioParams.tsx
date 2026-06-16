import type {
  ScenarioParams as ScenarioParamsType,
} from "@/lib/scenarios";
import type { AppCopy } from "@/lib/i18n";
import type { ScenarioTokenEstimate } from "@/lib/scenarioTokens";
import { toSafeNumber } from "@/lib/safeNumber";
import { InlineTokenEstimator } from "./TokenEstimator";

interface ScenarioParamsProps {
  params: ScenarioParamsType;
  tokenEstimate: ScenarioTokenEstimate;
  copy: AppCopy["scenarioParams"];
  estimatorCopy: AppCopy["tokenEstimator"];
  onChange: (params: ScenarioParamsType) => void;
}

interface FieldConfig<T extends object> {
  key: keyof T;
  label: string;
  hint: string;
  step?: number;
  max?: number;
  integer?: boolean;
  /** If true, show the inline token estimator button */
  estimable?: boolean;
}

export function ScenarioParams({
  params,
  tokenEstimate,
  copy,
  estimatorCopy,
  onChange,
}: ScenarioParamsProps) {
  return (
    <section aria-labelledby="scenario-params-heading" className="space-y-3">
      <div>
        <h2
          id="scenario-params-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {copy.heading}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {copy.description}
        </p>
      </div>
      {renderFields(params, copy, estimatorCopy, onChange)}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label={copy.avgInput} value={tokenEstimate.avgInputTokens} />
        <MetricCard label={copy.avgOutput} value={tokenEstimate.avgOutputTokens} />
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          {copy.notes[params.kind] ?? tokenEstimate.note}
        </div>
      </div>
    </section>
  );
}

function renderFields(
  params: ScenarioParamsType,
  copy: AppCopy["scenarioParams"],
  estimatorCopy: AppCopy["tokenEstimator"],
  onChange: (params: ScenarioParamsType) => void,
) {
  const field = (key: string, fallback: { label: string; hint: string }) =>
    copy.fields[key] ?? fallback;

  switch (params.kind) {
    case "chatbot": {
      const p = params;
      const handleEstimate = (key: string, tokens: number) =>
        onChange({ kind: "chatbot", values: { ...p.values, [key]: tokens } as typeof p.values });
      return (
        <FieldGrid
          values={p.values}
          fields={[
            {
              key: "systemPromptTokens",
              ...field("systemPromptTokens", {
                label: "System prompt tokens",
                hint: "Persona, guardrails, and product instructions.",
              }),
            },
            {
              key: "userMessageTokens",
              ...field("userMessageTokens", {
                label: "User message tokens",
                hint: "Average user message length.",
              }),
              estimable: true,
            },
            {
              key: "historyTokens",
              ...field("historyTokens", {
                label: "Recent history tokens",
                hint: "Conversation context carried into each request.",
              }),
            },
            {
              key: "answerTokens",
              ...field("answerTokens", {
                label: "Answer tokens",
                hint: "Average model response length.",
              }),
              estimable: true,
            },
          ]}
          estimatorCopy={estimatorCopy}
          onChange={(values) => onChange({ kind: "chatbot", values })}
          onEstimate={handleEstimate}
        />
      );
    }
    case "rag": {
      const p = params;
      const handleEstimate = (key: string, tokens: number) =>
        onChange({ kind: "rag", values: { ...p.values, [key]: tokens } as typeof p.values });
      return (
        <FieldGrid
          values={p.values}
          fields={[
            {
              key: "systemPromptTokens",
              ...field("systemPromptTokens", {
                label: "System prompt tokens",
                hint: "Instructions used for every RAG answer.",
              }),
            },
            {
              key: "userQuestionTokens",
              ...field("userQuestionTokens", {
                label: "User question tokens",
                hint: "Average question length.",
              }),
              estimable: true,
            },
            {
              key: "topK",
              ...field("topK", {
                label: "Retrieved chunks",
                hint: "How many chunks are injected per request.",
              }),
              integer: true,
              max: 50,
            },
            {
              key: "avgChunkTokens",
              ...field("avgChunkTokens", {
                label: "Avg chunk tokens",
                hint: "Average token length per retrieved chunk.",
              }),
              estimable: true,
            },
            {
              key: "answerTokens",
              ...field("answerTokens", {
                label: "Answer tokens",
                hint: "Average grounded answer length.",
              }),
              estimable: true,
            },
          ]}
          estimatorCopy={estimatorCopy}
          onChange={(values) => onChange({ kind: "rag", values })}
          onEstimate={handleEstimate}
        />
      );
    }
    case "agent": {
      const p = params;
      const handleEstimate = (key: string, tokens: number) =>
        onChange({ kind: "agent", values: { ...p.values, [key]: tokens } as typeof p.values });
      return (
        <FieldGrid
          values={p.values}
          fields={[
            {
              key: "baseCalls",
              ...field("baseCalls", {
                label: "Base calls / task",
                hint: "Planned model calls before retries.",
              }),
              integer: true,
              max: 100,
            },
            {
              key: "retries",
              ...field("retries", {
                label: "Retries / task",
                hint: "Average extra calls from retries or revisions.",
              }),
              integer: true,
              max: 100,
            },
            {
              key: "systemPromptTokens",
              ...field("systemPromptTokens", {
                label: "System prompt tokens",
                hint: "Agent instructions included on each call.",
              }),
            },
            {
              key: "toolResultTokens",
              ...field("toolResultTokens", {
                label: "Tool result tokens",
                hint: "Average tool output returned to the model.",
              }),
              estimable: true,
            },
            {
              key: "finalAnswerTokens",
              ...field("finalAnswerTokens", {
                label: "Answer tokens / call",
                hint: "Average output per model call.",
              }),
              estimable: true,
            },
          ]}
          estimatorCopy={estimatorCopy}
          onChange={(values) => onChange({ kind: "agent", values })}
          onEstimate={handleEstimate}
        />
      );
    }
    case "code": {
      const p = params;
      const handleEstimate = (key: string, tokens: number) =>
        onChange({ kind: "code", values: { ...p.values, [key]: tokens } as typeof p.values });
      return (
        <FieldGrid
          values={p.values}
          fields={[
            {
              key: "codeContextTokens",
              ...field("codeContextTokens", {
                label: "Code context tokens",
                hint: "Files, snippets, and diagnostics in context.",
              }),
              estimable: true,
            },
            {
              key: "userQuestionTokens",
              ...field("userQuestionTokens", {
                label: "User question tokens",
                hint: "Average developer prompt length.",
              }),
              estimable: true,
            },
            {
              key: "sessionTurns",
              ...field("sessionTurns", {
                label: "Session turns",
                hint: "How many output turns a request usually creates.",
              }),
              integer: true,
              max: 100,
            },
            {
              key: "perTurnOutputTokens",
              ...field("perTurnOutputTokens", {
                label: "Output tokens / turn",
                hint: "Average code or explanation generated per turn.",
              }),
              estimable: true,
            },
          ]}
          estimatorCopy={estimatorCopy}
          onChange={(values) => onChange({ kind: "code", values })}
          onEstimate={handleEstimate}
        />
      );
    }
    case "summarizer": {
      const p = params;
      const handleEstimate = (key: string, tokens: number) =>
        onChange({ kind: "summarizer", values: { ...p.values, [key]: tokens } as typeof p.values });
      return (
        <FieldGrid
          values={p.values}
          fields={[
            {
              key: "documentTokens",
              ...field("documentTokens", {
                label: "Document tokens",
                hint: "Average input document length.",
              }),
              estimable: true,
            },
            {
              key: "compressionRatio",
              ...field("compressionRatio", {
                label: "Compression ratio",
                hint: "0.075 means output is about 7.5% of the document.",
              }),
              step: 0.01,
              max: 1,
            },
          ]}
          estimatorCopy={estimatorCopy}
          onChange={(values) => onChange({ kind: "summarizer", values })}
          onEstimate={handleEstimate}
        />
      );
    }
  }
}

function FieldGrid<T extends object>({
  values,
  fields,
  estimatorCopy,
  onChange,
  onEstimate,
}: {
  values: T;
  fields: FieldConfig<T>[];
  estimatorCopy: AppCopy["tokenEstimator"];
  onChange: (values: T) => void;
  onEstimate: (key: string, tokens: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <NumberField
          key={String(field.key)}
          id={String(field.key)}
          label={field.label}
          hint={field.hint}
          value={Number(values[field.key])}
          step={field.step}
          max={field.max}
          integer={field.integer}
          estimable={field.estimable}
          estimatorCopy={estimatorCopy}
          fieldLabel={field.label}
          onChange={(next) =>
            onChange({
              ...values,
              [field.key]: next,
            })
          }
          onEstimate={(tokens) => onEstimate(String(field.key), tokens)}
        />
      ))}
    </div>
  );
}

function NumberField({
  id,
  label,
  hint,
  value,
  step = 1,
  max,
  integer,
  estimable,
  estimatorCopy,
  fieldLabel,
  onChange,
  onEstimate,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  step?: number;
  max?: number;
  integer?: boolean;
  estimable?: boolean;
  estimatorCopy: AppCopy["tokenEstimator"];
  fieldLabel: string;
  onChange: (value: number) => void;
  onEstimate: (tokens: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label
          htmlFor={`scenario-${id}`}
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          {label}
        </label>
        {estimable && (
          <InlineTokenEstimator
            copy={estimatorCopy}
            fieldLabel={fieldLabel}
            currentValue={value}
            onApply={onEstimate}
          />
        )}
      </div>
      <input
        id={`scenario-${id}`}
        type="number"
        inputMode="decimal"
        min={0}
        max={max}
        step={step}
        value={Number.isFinite(value) && value > 0 ? value : ""}
        onChange={(e) =>
          onChange(
            toSafeNumber(e.target.value, 0, {
              min: 0,
              max,
              integer,
            }),
          )
        }
        className={[
          "w-full rounded-lg border px-3 py-2 text-sm tabular-nums placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
          "border-zinc-300 bg-white text-zinc-900",
          "focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900",
          "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100",
          "dark:focus:border-zinc-300 dark:focus:ring-zinc-300",
        ].join(" ")}
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
      <dt className="text-xs uppercase text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
        {Math.round(safeValue).toLocaleString("en-US")}
      </dd>
    </div>
  );
}
