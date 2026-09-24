import { useState } from "react";
import { Download, Play, RotateCcw } from "lucide-react";
import { useServiceAggregator } from "@/hooks/useServiceAggregator";
import type {
  AggregatedResponse,
  HttpMethod,
  ServiceAggregatorDefinition,
} from "./aggregator.types";

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: "bg-gray-200/70 text-gray-600",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  PATCH: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
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
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 text-left"
        aria-expanded={open}
      >
        <span
          className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
            item.ok
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.ok ? "OK" : "FAIL"}
        </span>
        <span
          className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${METHOD_STYLES[item.method]}`}
        >
          {item.method}
        </span>
        {item.write && (
          <span className="inline-flex shrink-0 items-center rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px] font-semibold text-orange-700">
            WRITE
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-700">
          {item.label}
        </span>
        <span className="shrink-0 text-[11px] text-gray-400">
          {item.durationMs}ms
        </span>
        <span className="shrink-0 text-[11px] text-gray-400">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      <p className="mt-1 truncate font-mono text-[11px] text-gray-400">
        {item.url}
      </p>

      {open && (
        <div className="mt-2">
          {item.error ? (
            <p className="rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-600">
              {item.error}
            </p>
          ) : (
            <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 px-3 py-2.5 font-mono text-[11px] leading-4 text-gray-100">
              {formatBody(item.response)}
            </pre>
          )}
          <p className="mt-1 text-[11px] text-gray-400">{item.timestamp}</p>
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
      className="flex flex-col rounded-2xl border border-gray-200 bg-white px-5 py-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-gray-800">
            {definition.name}
          </h3>
          <p className="mt-0.5 font-mono text-[11px] text-gray-400">
            {definition.serviceFile}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            writeCount > 0
              ? "bg-blue-50 text-blue-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {writeCount > 0 ? "GET + writes" : "GET only"}
        </span>
      </div>

      <p className="mt-2 text-[13px] leading-5 text-gray-500">
        {definition.description}
      </p>

      <p className="mt-2 text-xs text-gray-400">
        {readCount} read{readCount === 1 ? "" : "s"}
        {writeCount > 0 && ` · ${writeCount} write${writeCount === 1 ? "" : "s"}`}
        {responses.length > 0 &&
          ` · ${succeeded} succeeded · ${failed} failed`}
        {!isReady && " · waiting for sign-in"}
        {definition.requiresRestaurantId && " · needs restaurant"}
      </p>

      {writeCount > 0 && (
        <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-lg border border-orange-200 bg-orange-50/60 px-3 py-2 text-[13px] text-orange-800">
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
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="h-3.5 w-3.5" />
          {running ? "Running…" : willRunWrites ? "Run all" : "Run"}
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={running || responses.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear
        </button>
        <button
          type="button"
          onClick={() => download("json")}
          disabled={running || responses.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          JSON
        </button>
        <button
          type="button"
          onClick={() => download("txt")}
          disabled={running || responses.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          TXT
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
          {error}
        </p>
      )}

      {probeCount === 0 && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-700">
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
