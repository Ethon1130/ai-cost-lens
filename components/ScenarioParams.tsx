import type {
  ScenarioParams as ScenarioParamsType,
} from "@/lib/scenarios";
import type { AppCopy } from "@/lib/i18n";
import type { ScenarioTokenEstimate } from "@/lib/scenarioTokens";
import { toSafeNumber } from "@/lib/safeNumber";

interface ScenarioParamsProps {
  params: ScenarioParamsType;
  tokenEstimate: ScenarioTokenEstimate;
  copy: AppCopy["scenarioParams"];
  onChange: (params: ScenarioParamsType) => void;
}

interface FieldConfig<T extends object> {
  key: keyof T;
  label: string;
  hint: string;
  step?: number;
  max?: number;
  integer?: boolean;
}

export function ScenarioParams({
  params,
  tokenEstimate,
  copy,
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
      {renderFields(params, copy, onChange)}
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
  onChange: (params: ScenarioParamsType) => void,
) {
  const field = (key: string, fallback: { label: string; hint: string }) =>
    copy.fields[key] ?? fallback;

  switch (params.kind) {
    case "chatbot":
      return (
        <FieldGrid
          values={params.values}
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
            },
          ]}
          onChange={(values) => onChange({ kind: "chatbot", values })}
        />
      );
    case "rag":
      return (
        <FieldGrid
          values={params.values}
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
            },
            {
              key: "answerTokens",
              ...field("answerTokens", {
                label: "Answer tokens",
                hint: "Average grounded answer length.",
              }),
            },
          ]}
          onChange={(values) => onChange({ kind: "rag", values })}
        />
      );
    case "agent":
      return (
        <FieldGrid
          values={params.values}
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
            },
            {
              key: "finalAnswerTokens",
              ...field("finalAnswerTokens", {
                label: "Answer tokens / call",
                hint: "Average output per model call.",
              }),
            },
          ]}
          onChange={(values) => onChange({ kind: "agent", values })}
        />
      );
    case "code":
      return (
        <FieldGrid
          values={params.values}
          fields={[
            {
              key: "codeContextTokens",
              ...field("codeContextTokens", {
                label: "Code context tokens",
                hint: "Files, snippets, and diagnostics in context.",
              }),
            },
            {
              key: "userQuestionTokens",
              ...field("userQuestionTokens", {
                label: "User question tokens",
                hint: "Average developer prompt length.",
              }),
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
            },
          ]}
          onChange={(values) => onChange({ kind: "code", values })}
        />
      );
    case "summarizer":
      return (
        <FieldGrid
          values={params.values}
          fields={[
            {
              key: "documentTokens",
              ...field("documentTokens", {
                label: "Document tokens",
                hint: "Average input document length.",
              }),
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
          onChange={(values) => onChange({ kind: "summarizer", values })}
        />
      );
  }
}

function FieldGrid<T extends object>({
  values,
  fields,
  onChange,
}: {
  values: T;
  fields: FieldConfig<T>[];
  onChange: (values: T) => void;
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
          onChange={(next) =>
            onChange({
              ...values,
              [field.key]: next,
            })
          }
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
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  step?: number;
  max?: number;
  integer?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={`scenario-${id}`}
        className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
      >
        {label}
      </label>
      <input
        id={`scenario-${id}`}
        type="number"
        inputMode="decimal"
        min={0}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : 0}
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
          "w-full rounded-lg border px-3 py-2 text-sm tabular-nums",
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
