import { api, getJSON } from "./client";
import type {
  Article,
  ArticleListResponse,
  ArticleSummary,
} from "@/types/article";

export interface ListArticlesParams {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  q?: string;
  status?: "draft" | "published";
  token?: string;
}

export function listArticles(params: ListArticlesParams = {}) {
  const { token, ...rest } = params;
  return getJSON<ArticleListResponse>("/articles", rest);
}

export function getArticleBySlug(slug: string) {
  return getJSON<Article>(`/articles/slug/${encodeURIComponent(slug)}`);
}

export function createArticle(input: Partial<Article> & { token: string }) {
  const { token, ...rest } = input;
  return api<Article>("/articles", { method: "POST", body: rest, token });
}

export function updateArticle(
  id: number,
  input: Partial<Article> & { token: string }
) {
  const { token, ...rest } = input;
  return api<Article>(`/articles/${id}`, {
    method: "PUT",
    body: rest,
    token,
  });
}

export function deleteArticle(id: number, token: string) {
  return api<void>(`/articles/${id}`, { method: "DELETE", token });
}

export function myDrafts(token: string) {
  return getJSON<ArticleListResponse>("/articles/me", { token });
}

export type { Article, ArticleSummary };