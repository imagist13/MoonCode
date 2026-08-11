export type ArticleStatus = "draft" | "published";

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  contentHtml?: string | null;
  cover?: string | null;
  status: ArticleStatus;
  category?: CategoryRef | null;
  tags?: TagRef[];
  author?: AuthorRef | null;
  viewCount?: number;
  likeCount?: number;
  readingTime?: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleSummary {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover?: string | null;
  status: ArticleStatus;
  category?: CategoryRef | null;
  tags?: TagRef[];
  author?: AuthorRef | null;
  viewCount?: number;
  likeCount?: number;
  readingTime?: number;
  publishedAt?: string | null;
  createdAt: string;
}

export interface CategoryRef {
  id: number;
  slug: string;
  name: string;
}

export interface TagRef {
  id: number;
  slug: string;
  name: string;
}

export interface AuthorRef {
  id: number;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
}

export interface ArticleListResponse {
  items: ArticleSummary[];
  total: number;
  page: number;
  pageSize: number;
}