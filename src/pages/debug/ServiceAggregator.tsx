import { useState } from "react";
import { Download, Play, RotateCcw } from "lucide-react";
import { useServiceAggregator } from "@/hooks/useServiceAggregator";
import type {
  AggregatedResponse,
  HttpMethod,
  ServiceAggregatorDefinition,
} from "./aggregator.types";

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: "bg-inset text-ink-secondary",
  POST: "bg-inset-accent text-brand-active",
  PUT: "bg-warning-soft text-warning",
  PATCH: "bg-warning-soft text-warning",
  DELETE: "bg-danger-soft text-danger-strong",
};

const formatBody = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
};

function ResponseItem({ item }: { item: AggregatedResponse }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-line-subtle bg-inset px-3 py-2.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 text-left"
        aria-expanded={open}
      >
        <span
          className={`inline-flex shrink-0 items-center rounded-2xl px-1.5 py-0.5 text-[11px] font-semibold ${
            item.ok
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger-strong"
          }`}
        >
          {item.ok ? "OK" : "FAIL"}
        </span>
        <span
          className={`inline-flex shrink-0 items-center rounded-2xl px-1.5 py-0.5 text-[11px] font-semibold ${METHOD_STYLES[item.method]}`}
        >
          {item.method}
        </span>
        {item.write && (
          <span className="inline-flex shrink-0 items-center rounded-2xl bg-warning-soft px-1.5 py-0.5 text-[11px] font-semibold text-warning">
            WRITE
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-secondary">
          {item.label}
        </span>
        <span className="shrink-0 text-[11px] text-ink-subtle">
          {item.durationMs}ms
        </span>
        <span className="shrink-0 text-[11px] text-ink-subtle">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      <p className="mt-1 truncate font-mono text-[11px] text-ink-subtle">
        {item.url}
      </p>

      {open && (
        <div className="mt-2">
          {item.error ? (
            <p className="rounded-2xl bg-danger-soft px-2.5 py-2 text-xs text-danger">
              {item.error}
            </p>
          ) : (
            <pre className="max-h-64 overflow-auto rounded-2xl bg-ink px-3 py-2.5 font-mono text-[11px] leading-4 text-ink-inverted">
              {formatBody(item.response)}
            </pre>
          )}
          <p className="mt-1 text-[11px] text-ink-subtle">{item.timestamp}</p>
        </div>
      )}
    </div>
  );
}

export function ServiceAggregator({
  definition,
}: {
  definition: ServiceAggregatorDefinition;
}) {
  const {
    responses,
    running,
    error,
    run,
    download,
    clear,
    isReady,
    probeCount,
    readCount,
    writeCount,
  } = useServiceAggregator(definition);
  const [includeWrites, setIncludeWrites] = useState(false);

  const succeeded = responses.filter((response) => response.ok).length;
  const failed = responses.filter((response) => !response.ok).length;
  const willRunWrites = includeWrites && writeCount > 0;

  return (
    <article
      aria-label={`${definition.name} aggregator`}
      className="flex flex-col rounded-2xl border border-line bg-surface px-5 py-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink">
            {definition.name}
          </h3>
          <p className="mt-0.5 font-mono text-[11px] text-ink-subtle">
            {definition.serviceFile}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            writeCount > 0
              ? "bg-inset-accent text-brand-active"
              : "bg-success-soft text-success"
          }`}
        >
          {writeCount > 0 ? "GET + writes" : "GET only"}
        </span>
      </div>

      <p className="mt-2 text-[13px] leading-5 text-ink-muted">
        {definition.description}
      </p>

      <p className="mt-2 text-xs text-ink-subtle">
        {readCount} read{readCount === 1 ? "" : "s"}
        {writeCount > 0 && ` · ${writeCount} write${writeCount === 1 ? "" : "s"}`}
        {responses.length > 0 &&
          ` · ${succeeded} succeeded · ${failed} failed`}
        {!isReady && " · waiting for sign-in"}
        {definition.requiresRestaurantId && " · needs restaurant"}
      </p>

      {writeCount > 0 && (
        <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-2xl border border-warning-line bg-warning-soft px-3 py-2 text-[13px] text-warning">
          <input
            type="checkbox"
            checked={includeWrites}
            onChange={(event) => setIncludeWrites(event.target.checked)}
            disabled={running}
            className="mt-0.5"
          />
          <span>
            Include write requests. These create and clean up{" "}
            <span className="font-semibold">[API-TEST]</span> records against
            the live API.
          </span>
        </label>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run({ includeWrites: willRunWrites })}
          disabled={running || !isReady || probeCount === 0}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-ink px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="h-3.5 w-3.5" />
          {running ? "Running…" : willRunWrites ? "Run all" : "Run"}
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={running || responses.length === 0}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-line px-3 py-1.5 text-[13px] font-medium text-ink-secondary transition hover:bg-inset disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear
        </button>
        <button
          type="button"
          onClick={() => download("json")}
          disabled={running || responses.length === 0}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-line px-3 py-1.5 text-[13px] font-medium text-ink-secondary transition hover:bg-inset disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          JSON
        </button>
        <button
          type="button"
          onClick={() => download("txt")}
          disabled={running || responses.length === 0}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-line px-3 py-1.5 text-[13px] font-medium text-ink-secondary transition hover:bg-inset disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          TXT
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-2xl bg-danger-soft px-3 py-2 text-[13px] text-danger">
          {error}
        </p>
      )}

      {probeCount === 0 && (
        <p className="mt-3 rounded-2xl bg-warning-soft px-3 py-2 text-[13px] text-warning">
          No probes are available for this service with the current account
          context.
        </p>
      )}

      {responses.length > 0 && (
        <div className="mt-3 space-y-2">
          {responses.map((item) => (
            <ResponseItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </article>
  );
}

export default ServiceAggregator;
