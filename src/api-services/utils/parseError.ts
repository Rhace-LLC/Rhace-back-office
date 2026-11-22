export function parseError(error: unknown): string {
  if (!error) return "An unknown error occurred";

  // Case 1: plain string
  if (typeof error === "string") {
    return error;
  }

  // Case 2: standard Error object
  if (error instanceof Error) {
    return error.message || "An unknown error occurred";
  }

  // Case 3: API error object
  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;

    // direct message or detail
    if (typeof errObj.message === "string") return errObj.message;
    if (typeof errObj.detail === "string") return errObj.detail;

    // handle "errors" object (like { errors: { field: ["msg1", "msg2"] } })
    if (errObj.errors && typeof errObj.errors === "object") {
      const fieldErrors = errObj.errors as Record<string, unknown>;
      const messages: string[] = [];

      for (const key in fieldErrors) {
        const val = fieldErrors[key];
        if (Array.isArray(val) && val.length > 0) {
          messages.push(`${key}: ${val.join(", ")}`);
        } else if (typeof val === "string") {
          messages.push(`${key}: ${val}`);
        }
      }

      if (messages.length > 0) {
        return messages.join(" | ");
      }
    }

    // fallback: check top-level fields
    for (const key in errObj) {
      const val = errObj[key];
      if (Array.isArray(val) && val.length > 0) {
        return `Field ${key}: ${val.join(", ")}`;
      }
      if (typeof val === "string") {
        return `Field ${key}: ${val}`;
      }
    }
  }

  return "An unknown error occurred";
}

/** `parseError` with a context-specific fallback instead of the generic
 * "An unknown error occurred". */
export function parseErrorOr(error: unknown, fallback: string): string {
  const message = parseError(error);
  return message === "An unknown error occurred" ? fallback : message;
}
