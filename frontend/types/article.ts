/** 文章状态（与后端保持一致）。 */
export const ArticleStatus = {
  Draft: 0,
  Published: 1,
  Archived: 2,
} as const;
export type ArticleStatusValue = (typeof ArticleStatus)[keyof typeof ArticleStatus];

/** 文章内嵌的轻量作者/分类/标签（列表页够用）。 */
export interface ArticleAuthorRef {
  id: number;
  username?: string;
  nickname?: string;
  avatar?: string;
}
export interface ArticleCategoryRef {
  id: number;
  name: string;
  slug: string;
}
export interface ArticleTagRef {
  id: number;
  name: string;
  slug: string;
}

/** 文章实体。 */
export interface Article {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  cover?: string;
  status: ArticleStatusValue;
  reading_time?: number;
  views?: number;
  likes?: number;
  category_id?: number;
  category?: ArticleCategoryRef;
  tags?: ArticleTagRef[];
  author_id?: number;
  author?: ArticleAuthorRef;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

/** 创建文章负载。 */
export interface CreateArticlePayload {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  cover?: string;
  category_id?: number;
  tag_ids?: number[];
  status?: ArticleStatusValue;
}

/** 文章列表查询参数。 */
export interface ArticleListQuery {
  page?: number;
  pageSize?: number;
  category_id?: number;
  tag_id?: number;
  status?: ArticleStatusValue;
  keyword?: string;
}
