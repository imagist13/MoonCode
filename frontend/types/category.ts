import type { ArticleSummary } from "./article";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  articleCount?: number;
  latestArticle?: Pick<
    ArticleSummary,
    "id" | "title" | "slug" | "publishedAt"
  > | null;
}