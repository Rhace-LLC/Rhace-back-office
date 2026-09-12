import { Bug } from "lucide-react";
import { APIResponseAggregator } from "./APIResponseAggregator";

export default function DebugPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-8 lg:px-12">
      <header className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-cardfill text-brand">
          <Bug className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
            Debug
          </h1>
          <p className="mt-1 text-sm leading-5 text-ink-muted">
            Local-only tools. Not available in production.
          </p>
        </div>
      </header>

      <div className="py-4" />

      <APIResponseAggregator />
    </div>
  );
}
