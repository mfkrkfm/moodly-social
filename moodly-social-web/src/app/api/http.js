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
  if (typeof body === "string") return body;
  return body.detail || body.title || body.error || body.message || fallback;
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
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

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
