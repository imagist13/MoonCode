import { API_BASE } from "@/lib/constants";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  token?: string;
  next?: { revalidate?: number; tags?: string[] };
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, query, headers, token, ...rest } = options;
  const isServer = typeof window === "undefined";
  const finalHeaders = new Headers(headers);
  if (!(body instanceof FormData) && body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  if (isServer) {
    finalHeaders.set("Cache-Control", "no-store");
  }

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  if (!res.ok) {
    let payload: unknown = undefined;
    try {
      payload = await res.json();
    } catch {
      try {
        payload = await res.text();
      } catch {}
    }
    let message = res.statusText || "Request failed";
    if (payload && typeof payload === "object" && "message" in payload) {
      const m = (payload as { message?: unknown }).message;
      if (typeof m === "string") message = m;
    }
    throw new ApiError(message, res.status, payload);
  }

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as T;
}

export async function getJSON<T>(path: string, query?: RequestOptions["query"]) {
  return api<T>(path, { method: "GET", query });
}