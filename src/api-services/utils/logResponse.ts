/**
 * Logs an API response and forwards it to the caller, so request layers can
 * capture raw payloads while the exact response types are still being pinned
 * down.
 */
export const logResponse = async <T>(
  tag: string,
  label: string,
  request: Promise<unknown>
): Promise<T> => {
  const data = await request;
  console.log(`[${tag}] ${label} →`, data);
  return data as T;
};
