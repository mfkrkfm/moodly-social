import { clearAuth, getAuth } from "./authStore.js";

export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "";

function buildUrl(path) {
  if (path.startsWith("http")) return path;
  return `${String(API_BASE_URL).replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

function pickErrorMessage(body, fallback) {
  if (!body) return fallback;

  // If body is a JSON string, try to parse it into an object so we can
  // extract structured validation messages instead of returning a raw JSON blob.
  let payload = body;
  if (typeof body === "string") {
    const trimmed = body.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        payload = JSON.parse(trimmed);
      } catch (e) {
        // Not valid JSON, return raw string
        return body;
      }
    } else {
      return body;
    }
  }

  // Now payload is either the original object or the parsed JSON object.
  if (payload && typeof payload === "object") {
    if (payload.errors && typeof payload.errors === "object") {
      try {
        const msgs = [];
        for (const val of Object.values(payload.errors)) {
          if (!val) continue;
          if (Array.isArray(val)) {
            msgs.push(...val.map((v) => String(v).trim()).filter(Boolean));
          } else {
            msgs.push(String(val).trim());
          }
        }
        if (msgs.length) return msgs.join("; ");
      } catch (e) {
        // fall through to other fields
      }
    }

    return payload.detail || payload.title || payload.error || payload.message || fallback;
  }

  return fallback;
}

export async function http(path, opts = {}) {
  const url = buildUrl(path);

  const headers = new Headers(opts.headers || {});

  const token = opts.token ?? getAuth();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (!headers.has("Content-Type") && opts.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...opts, headers });

  // Handle 401 globally
  if (res.status === 401) {
    clearAuth();
    // Avoid infinite loops if already on login page
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  let body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  // If server returned a JSON payload but didn't set content-type, try to parse the text
  if (!isJson && typeof body === "string") {
    const trimmed = body.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        body = parsed;
      } catch (e) {
        // leave body as text
      }
    }
  }

  if (!res.ok) {
    const message = pickErrorMessage(body, res.statusText || "Request failed");
    throw new HttpError(res.status, String(message), body);
  }

  return body;
}

export async function httpBlob(path, opts = {}) {
  const url = buildUrl(path);
  const headers = new Headers(opts.headers || {});
  const token = opts.token ?? getAuth();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    throw new HttpError(res.status, res.statusText || "Request failed", null);
  }
  return res.blob();
}
