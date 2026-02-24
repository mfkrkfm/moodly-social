export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8080";

export type HttpError = {
  status: number;
  message: string;
  details?: any;
};

function buildUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${String(API_BASE_URL).replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function http<T>(
  path: string,
  opts: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const url = buildUrl(path);

  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type") && opts.body) headers.set("Content-Type", "application/json");
  if (opts.token) headers.set("Authorization", `Bearer ${opts.token}`);

  const res = await fetch(url, { ...opts, headers });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const msg = (body && (body.error || body.message)) || res.statusText || "Request failed";
    const err: HttpError = { status: res.status, message: String(msg), details: body };
    throw err;
  }

  return body as T;
}
