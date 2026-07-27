import { apiFetch } from "./client";
import type { Category } from "@/types/category";

/** 分类 API。 */
export const categories = {
  list: (opts?: { revalidate?: number }) =>
    apiFetch<Category[]>("/categories", {
      next: opts?.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined,
    }),
  bySlug: (slug: string) =>
    apiFetch<Category>(`/categories/slug/${encodeURIComponent(slug)}`),
  create: (payload: Partial<Category>, token: string) =>
    apiFetch<Category>("/categories", { method: "POST", body: payload, token }),
};
