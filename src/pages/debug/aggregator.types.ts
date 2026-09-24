export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface AggregatorContext {
  restaurantId?: string;
  restaurantSlug?: string;
  token: string;
  userId?: string;
}

export interface ApiProbe {
  id: string;
  label: string;
  method: HttpMethod;
  url: string;
  /** True when the probe mutates data. Only runs when writes are opted in. */
  write?: boolean;
  request: () => Promise<unknown>;
}

export interface ServiceAggregatorDefinition {
  id: string;
  name: string;
  serviceFile: string;
  description: string;
  requiresRestaurantId?: boolean;
  hasWriteProbes?: boolean;
  getProbes: (context: AggregatorContext) => ApiProbe[];
}

export interface AggregatedResponse {
  id: string;
  serviceId: string;
  serviceName: string;
  label: string;
  method: HttpMethod;
  url: string;
  /** Mirrors the probe's write flag so exports stay self-describing. */
  write?: boolean;
  ok: boolean;
  timestamp: string;
  durationMs: number;
  response?: unknown;
  error?: string;
}

export const createApiProbe = (
  id: string,
  label: string,
  method: HttpMethod,
  url: string,
  request: () => Promise<unknown>,
  write = false
): ApiProbe => ({
  id,
  label,
  method,
  url,
  request,
  ...(write ? { write: true as const } : {}),
});

/** Prefix marking records created by debug probes. Safe to delete. */
export const API_TEST_TAG = "[API-TEST]";

export const testName = (base: string) =>
  `${API_TEST_TAG} ${base} ${new Date().toISOString()}`;

const recordId = (value: unknown): string | undefined => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const id = (value as Record<string, unknown>).id;
    if (typeof id === "string" && id.length > 0) return id;
    if (typeof id === "number") return String(id);
  }
  return undefined;
};

/** Pulls the first record id out of common list-response shapes. */
export const extractFirstId = (value: unknown): string | undefined => {
  if (Array.isArray(value)) return recordId(value[0]);

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["results", "data", "items", "orders"]) {
      if (Array.isArray(record[key])) return recordId(record[key][0]);
    }
    return recordId(value);
  }

  return undefined;
};

/**
 * Pulls a created record's id out of the many shapes the API returns
 * (plain record, axios-style `{ data }` wrapper, or a list with one item).
 * Service wrappers return the raw axios response, so the `data` unwrap matters.
 */
export const extractCreatedId = (value: unknown): string | undefined => {
  const direct = recordId(value);
  if (direct) return direct;

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const wrapped = recordId((value as Record<string, unknown>).data);
    if (wrapped) return wrapped;
  }

  return extractFirstId(value);
};

/**
 * Throws a descriptive error when a dependent write probe has no id to act
 * on (e.g. its create step failed). The failure is recorded, not thrown away.
 */
export const requireTestId = (
  id: string | undefined,
  what: string
): string => {
  if (!id) throw new Error(`Skipped: ${what} (create step returned no id)`);
  return id;
};
