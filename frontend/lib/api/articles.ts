import { apiFetch, qs } from "./client";
import type { Paginated } from "@/types/api";
import type {
  Article,
  ArticleListQuery,
  CreateArticlePayload,
} from "@/types/article";

/** 文章相关 API。 */
export const articles = {
  list: (params: ArticleListQuery = {}, opts?: { revalidate?: number }) =>
    apiFetch<Paginated<Article>>(`/articles${qs(params)}`, {
      next: opts?.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined,
    }),

  bySlug: (slug: string, opts?: { revalidate?: number }) =>
    apiFetch<Article>(`/articles/slug/${encodeURIComponent(slug)}`, {
      next: opts?.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined,
    }),

  byId: (id: number | string, token?: string) =>
    apiFetch<Article>(`/articles/${id}`, { token }),

  slugs: () => apiFetch<string[]>("/articles/slugs"),

  create: (payload: CreateArticlePayload, token: string) =>
    apiFetch<Article>("/articles", { method: "POST", body: payload, token }),

  update: (id: number, payload: Partial<CreateArticlePayload>, token: string) =>
    apiFetch<Article>(`/articles/${id}`, {
      method: "PUT",
      body: payload,
      token,
    }),

  remove: (id: number, token: string) =>
    apiFetch<null>(`/articles/${id}`, { method: "DELETE", token }),
};
