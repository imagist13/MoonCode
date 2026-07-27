import { API_BASE } from "@/lib/constants";
import type { ApiResponse } from "@/types/api";

/**
 * 统一 API 错误。
 * status - HTTP 状态码
 * code   - 业务码
 * message - 用户可读消息
 */
export class ApiError extends Error {
  status: number;
  code: number;
  constructor(message: string, status: number, code: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** apiFetch 额外选项。 */
export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** JSON body（自动 stringify）。 */
  body?: unknown;
  /** JWT，添加 Authorization: Bearer */
  token?: string;
  /** Next.js fetch 缓存选项。 */
  next?: { revalidate?: number; tags?: string[] };
}

/**
 * 通用 fetch 封装：
 * - 自动拼接后端 API_BASE
 * - 自动 JSON 序列化 / 解析
 * - 校验后端 `{ code, message, data }` 包装：code !== 0 抛 ApiError
 * - 支持 Next.js `cache` / `next` 透传
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { body, token, headers, next, cache, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    // 默认 no-store，避免误命中构建缓存；调用方可通过 next.revalidate 开启 ISR
    cache: cache ?? (next?.revalidate ? undefined : "no-store"),
    next,
  });

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("响应不是合法 JSON", res.status, -1);
  }

  if (!res.ok || !payload || payload.code !== 0) {
    throw new ApiError(
      payload?.message ?? `请求失败：${res.status}`,
      res.status,
      payload?.code ?? -1
    );
  }
  return payload.data;
}

/** 序列化 query string，忽略 undefined。 */
export function qs(params: Record<string, unknown> | object = {}) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}
