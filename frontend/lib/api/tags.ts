import { apiFetch } from "./client";
import type { Tag } from "@/types/tag";

/** 标签 API。 */
export const tags = {
  list: (opts?: { revalidate?: number }) =>
    apiFetch<Tag[]>("/tags", {
      next: opts?.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined,
    }),
  bySlug: (slug: string) =>
    apiFetch<Tag>(`/tags/slug/${encodeURIComponent(slug)}`),
};
