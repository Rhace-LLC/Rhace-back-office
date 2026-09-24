import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { parseError } from "@/api-services/utils/parseError";
import type {
  AggregatedResponse,
  ApiProbe,
  ServiceAggregatorDefinition,
} from "@/pages/debug/aggregator.types";

const PROBE_TIMEOUT_MS = 20_000;

export interface RunAggregatorOptions {
  /** When true, mutating (write) probes run too. Default false. */
  includeWrites?: boolean;
}

interface AggregatorExport {
  generated_at: string;
  service: {
    id: string;
    name: string;
    file: string;
  };
  restaurant_id: string | null;
  total: number;
  succeeded: number;
  failed: number;
  responses: AggregatedResponse[];
}

const createResponseId = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const formatResponse = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
};

const requestWithTimeout = (request: () => Promise<unknown>) => {
  let timeoutId: number | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(
      () => reject(new Error("Probe timed out after 20 seconds")),
      PROBE_TIMEOUT_MS
    );
  });

  return Promise.race([request(), timeout]).finally(() => {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  });
};

const toPlainText = (payload: AggregatorExport) =>
  [
    `Service: ${payload.service.name}`,
    `Service file: ${payload.service.file}`,
    `Generated at: ${payload.generated_at}`,
    `Restaurant: ${payload.restaurant_id ?? "—"}`,
    `Total probes: ${payload.total}`,
    `Succeeded: ${payload.succeeded}`,
    `Failed: ${payload.failed}`,
    "",
    ...payload.responses.map((item) =>
      [
        "=".repeat(64),
        `${item.method} ${item.url}${item.write ? " [WRITE]" : ""}`,
        `Probe: ${item.label}`,
        `Duration: ${item.durationMs}ms`,
        `OK: ${item.ok}`,
        item.error ? `Error: ${item.error}` : "Response:",
        item.error ? "" : formatResponse(item.response),
        "",
      ].join("\n")
    ),
  ].join("\n");

export const useServiceAggregator = (config: ServiceAggregatorDefinition) => {
  const { restaurants, token, user } = useAuth();
  const restaurant = restaurants?.[0];
  const restaurantId = restaurant?.id;
  const restaurantSlug = restaurant?.slug;
  const userId = user?.id;
  const [responses, setResponses] = useState<AggregatedResponse[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const probes = useMemo(
    () => config.getProbes({ restaurantId, restaurantSlug, token, userId }),
    [config, restaurantId, restaurantSlug, token, userId]
  );
  const readCount = useMemo(
    () => probes.filter((probe) => !probe.write).length,
    [probes]
  );
  const writeCount = useMemo(
    () => probes.filter((probe) => probe.write).length,
    [probes]
  );
  const isReady = Boolean(
    token && (!config.requiresRestaurantId || restaurantId)
  );

  const runProbe = useCallback(
    async (configId: string, configName: string, probe: ApiProbe) => {
      const startedAt = performance.now();
      const baseResult = {
        id: createResponseId(),
        serviceId: configId,
        serviceName: configName,
        label: probe.label,
        method: probe.method,
        url: probe.url,
        timestamp: new Date().toISOString(),
        ...(probe.write ? { write: true as const } : {}),
      };

      try {
        const response = await requestWithTimeout(probe.request);
        const result: AggregatedResponse = {
          ...baseResult,
          ok: true,
          durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
          response,
        };
        return result;
      } catch (requestError) {
        const result: AggregatedResponse = {
          ...baseResult,
          ok: false,
          durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
          error: parseError(requestError),
        };
        return result;
      }
    },
    []
  );

  const run = useCallback(
    async (options?: RunAggregatorOptions) => {
      if (!token) {
        setError("Sign in before running API probes.");
        return;
      }

      if (config.requiresRestaurantId && !restaurantId) {
        setError("No restaurant is assigned to this account.");
        return;
      }

      // Sequential on purpose: write probes chain off ids captured by
      // earlier probes (create -> touch -> cleanup).
      const selected = probes.filter(
        (probe) => options?.includeWrites || !probe.write
      );

      setRunning(true);
      setError(null);
      setResponses([]);

      try {
        for (const probe of selected) {
          const result = await runProbe(config.id, config.name, probe);
          setResponses((previous) => [...previous, result]);
        }
      } finally {
        setRunning(false);
      }
    },
    [config.id, config.name, config.requiresRestaurantId, probes, restaurantId, runProbe, token]
  );

  const download = useCallback(
    (format: "json" | "txt") => {
      const payload: AggregatorExport = {
        generated_at: new Date().toISOString(),
        service: {
          id: config.id,
          name: config.name,
          file: config.serviceFile,
        },
        restaurant_id: restaurantId ?? null,
        total: responses.length,
        succeeded: responses.filter((response) => response.ok).length,
        failed: responses.filter((response) => !response.ok).length,
        responses,
      };

      const content =
        format === "json"
          ? JSON.stringify(payload, null, 2)
          : toPlainText(payload);
      const blob = new Blob([content], {
        type: format === "json" ? "application/json" : "text/plain",
      });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = `${config.id}-api-responses-${Date.now()}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    },
    [config.id, config.name, config.serviceFile, responses, restaurantId]
  );

  const clear = useCallback(() => {
    setResponses([]);
    setError(null);
  }, []);

  return {
    responses,
    running,
    error,
    run,
    download,
    clear,
    isReady,
    probeCount: probes.length,
    readCount,
    writeCount,
  };
};
