/**
 * Centralized helper to extract a human-friendly error message from unknown values.
 *
 * Usage:
 *   try {
 *     ...
 *   } catch (err) {
 *     toast.error(getErrorMessage(err));
 *   }
 */

type AnyObject = Record<string, unknown>;

function isObject(value: unknown): value is AnyObject {
  return typeof value === "object" && value !== null;
}

function hasStringMessage(value: unknown): value is { message: string } {
  return isObject(value) && typeof (value as AnyObject).message === "string";
}

/**
 * Attempt to extract a useful message from common HTTP client error shapes.
 * - Axios: error.response?.data?.message
 * - Fetch wrappers or custom backends: error.data?.message
 */
function getHttpishMessage(value: unknown): string | null {
  if (!isObject(value)) return null;

  const maybeAxios = (value as AnyObject).response;
  if (isObject(maybeAxios)) {
    const data = (maybeAxios as AnyObject).data;
    if (isObject(data) && typeof (data as AnyObject).message === "string") {
      return String((data as AnyObject).message);
    }
    // Some APIs return error as text string directly in data
    if (typeof data === "string" && data.trim()) {
      return data;
    }
  }

  const data = (value as AnyObject).data;
  if (isObject(data) && typeof (data as AnyObject).message === "string") {
    return String((data as AnyObject).message);
  }
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return null;
}

/**
 * Safe stringify for unknown inputs, avoiding circular reference errors.
 */
function safeStringify(value: unknown): string {
  try {
    if (typeof value === "string") return value;
    if (value instanceof Error) return value.message || value.name || "Error";
    if (isObject(value)) {
      // Prefer a compact shape with known fields if present
      const known: AnyObject = {};
      if ("message" in value) known.message = (value as AnyObject).message;
      if ("code" in value) known.code = (value as AnyObject).code;
      if ("name" in value) known.name = (value as AnyObject).name;
      if ("status" in value) known.status = (value as AnyObject).status;
      if ("statusText" in value) known.statusText = (value as AnyObject).statusText;
      if (Object.keys(known).length) return JSON.stringify(known);

      // Fallback to JSON.stringify with circular ref handling
      const seen = new WeakSet<object>();
      return JSON.stringify(
        value,
        (_k, v) => {
          if (typeof v === "object" && v !== null) {
            if (seen.has(v)) return "[Circular]";
            seen.add(v);
          }
          return v;
        },
        2
      );
    }
    return String(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

/**
 * Extract a user-friendly message from any thrown error-like value.
 *
 * Order of precedence:
 * 1) string
 * 2) Error.message
 * 3) error.response.data.message (Axios) or error.data.message
 * 4) error.message (loose check)
 * 5) JSON/stringified fallback
 * 6) provided fallback
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err == null) return fallback;

  // Plain string
  if (typeof err === "string") {
    const trimmed = err.trim();
    return trimmed || fallback;
  }

  // Native Error
  if (err instanceof Error) {
    return err.message || err.name || fallback;
  }

  // HTTP-ish client shapes (Axios/fetch wrappers)
  const httpish = getHttpishMessage(err);
  if (httpish && String(httpish).trim()) {
    return String(httpish).trim();
  }

  // Loose "message" presence
  if (hasStringMessage(err)) {
    const msg = err.message.trim();
    if (msg) return msg;
  }

  // Last resort: stringified snapshot
  const str = safeStringify(err).trim();
  return str || fallback;
}

export default getErrorMessage;
