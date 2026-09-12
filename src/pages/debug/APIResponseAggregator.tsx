import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Play,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiResponseAggregator } from "@/hooks/useApiResponseAggregator";

export const APIResponseAggregator = () => {
  const { restaurantId, responses, running, error, run, download, clear } =
    useApiResponseAggregator();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card className="w-full rounded-2xl border border-dashed border-gray-300 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base text-gray-800">
            API Response Aggregator
          </CardTitle>
          <p className="text-xs text-gray-400">
            Debug utility — probes promotion &amp; entertainment endpoints.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Collapse" : "Expand"}
        >
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>

      {open && (
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
            Runs all GET and POST probes (DELETE / PATCH / PUT are excluded).
            POST probes create a temporary{" "}
            <span className="font-semibold">[API-TEST]</span> promotion and
            toggle/apply promotions. They write real data.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={run}
              disabled={running || !restaurantId}
              className="h-9 gap-2"
            >
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {running ? "Running…" : "Run probes"}
            </Button>

            <Button
              variant="outline"
              className="h-9 gap-2"
              onClick={() => download("json")}
              disabled={responses.length === 0}
            >
              <Download className="h-4 w-4" />
              JSON
            </Button>

            <Button
              variant="outline"
              className="h-9 gap-2"
              onClick={() => download("txt")}
              disabled={responses.length === 0}
            >
              <Download className="h-4 w-4" />
              TXT
            </Button>

            <Button
              variant="ghost"
              className="h-9 gap-2 text-gray-500"
              onClick={clear}
              disabled={responses.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>

          {!restaurantId && (
            <p className="text-sm text-rose-500">
              No restaurant id available for this account.
            </p>
          )}

          {error && <p className="text-sm text-rose-500">{error}</p>}

          {responses.length > 0 && (
            <div className="space-y-2">
              {responses.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-gray-200"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((current) =>
                        current === item.id ? null : item.id
                      )
                    }
                    className="flex w-full items-center gap-3 bg-gray-50 px-3 py-2 text-left"
                  >
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                        item.method === "GET"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      )}
                    >
                      {item.method}
                    </span>
                    <span className="flex-1 truncate text-xs text-gray-600">
                      {item.url}
                    </span>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                        item.ok
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      )}
                    >
                      {item.ok ? "OK" : "Error"}
                    </span>
                  </button>

                  {expandedId === item.id && (
                    <pre className="max-h-80 overflow-auto bg-gray-900 px-4 py-3 text-[11px] leading-relaxed text-gray-100">
                      {item.ok
                        ? JSON.stringify(item.response, null, 2)
                        : `Error: ${item.error}`}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default APIResponseAggregator;
