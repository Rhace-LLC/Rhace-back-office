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
  if (typeof error === "object") {
    const errObj = error as Record<string, any>;

    // direct message or detail
    if (typeof errObj.message === "string") return errObj.message;
    if (typeof errObj.detail === "string") return errObj.detail;

    // detailed field errors (like field: ["This field is required."])
    for (const key in errObj) {
      const val = errObj[key];

      if (Array.isArray(val) && val.length > 0) {
        // if it's an array, join its messages
        return `Field ${key}: ${val.join(", ")}`;
      }

      if (typeof val === "string") {
        // simple string message
        return `Field ${key}: ${val}`;
      }
    }
  }

  return "An unknown error occurred";
}
