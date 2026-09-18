"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye, ChevronRight } from "lucide-react";
import { cn, formatViews, safeTruncate, stripMarkdown } from "@/lib/utils";

export interface ArticleCardData {
  id: number;
  title: string;
  cover?: string;
  summary?: string;
  content?: string;
  categoryName?: string;
  tags?: { id: number; name: string }[];
  author?: { name: string; avatar?: string };
  publishTime?: string;
  viewCount?: number;
  isTop?: boolean;
}

interface ArticleCardProps {
  article: ArticleCardData;
  /** 移动端横排布局（强制） */
  forceMobile?: boolean;
  /** 隐藏封面图 */
  hideCover?: boolean;
  className?: string;
}

/**
 * 文章卡片（spec §4.3）
 *  - 桌面：3 列网格中的纵向卡片，封面 16:9
 *  - 移动：固定 h-40 横排布局，封面占 1/3
 */
export function ArticleCard({
  article,
  forceMobile = false,
  hideCover = false,
  className,
}: ArticleCardProps) {
  const summary =
    article.summary ?? stripMarkdown(article.content ?? "").slice(0, 140);

  if (forceMobile) {
    return (
      <MobileCard
        article={article}
        summary={summary}
        hideCover={hideCover}
        className={className}
      />
    );
  }

  return (
    <Link href={`/articles/${article.id}`} className="block">
      <article
        className={cn(
          "article-card group flex flex-col overflow-hidden",
          className,
        )}
      >
        {/* 封面 */}
        {!hideCover && article.cover ? (
          <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={article.cover}
              alt={article.title}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {article.isTop && (
              <span className="absolute left-3 top-3 rounded bg-blue-500 px-2 py-0.5 text-xs font-medium text-white shadow">
                置顶
              </span>
            )}
          </div>
        ) : (
          !hideCover && (
            <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-purple-50 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-purple-900/20">
              <span className="text-sm text-gray-400">暂无封面</span>
            </div>
          )
        )}

        {/* 内容 */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          {/* 标题 */}
          <h3 className="line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
            {safeTruncate(article.title, 30)}
          </h3>

          {/* 摘要 */}
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {summary}
          </p>

          {/* 标签 */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {article.tags.slice(0, 3).map((t) => (
                <span key={t.id} className="article-tag">
                  {t.name}
                </span>
              ))}
            </div>
          )}

          {/* meta */}
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <div className="flex items-center gap-2">
              {article.author?.avatar ? (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-medium text-white">
                  {article.author?.name?.[0] || "U"}
                </div>
              )}
              <div className="flex flex-col">
                {article.author?.name && (
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {article.author.name}
                  </span>
                )}
                {article.publishTime && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {article.publishTime}
                  </span>
                )}
              </div>
            </div>
            {article.viewCount !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatViews(article.viewCount)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function MobileCard({
  article,
  summary,
  hideCover,
  className,
}: {
  article: ArticleCardData;
  summary: string;
  hideCover: boolean;
  className?: string;
}) {
  return (
    <Link href={`/articles/${article.id}`} className="block">
      <article
        className={cn(
          "article-card flex h-40 gap-0 overflow-hidden",
          className,
        )}
      >
        {!hideCover && article.cover ? (
          <div className="relative m-2 aspect-square h-[calc(100%-1rem)] w-[calc(100%-1rem)] shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={article.cover}
              alt={article.title}
              fill
              sizes="160px"
              className="object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          !hideCover && (
            <div className="m-2 flex aspect-square h-[calc(100%-1rem)] w-[calc(100%-1rem)] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 text-xs text-gray-400">
              无封面
            </div>
          )
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-between p-2">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs">
              {article.isTop && (
                <span className="rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  置顶
                </span>
              )}
              {article.categoryName && (
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-800/30 dark:text-blue-300">
                  {article.categoryName}
                </span>
              )}
            </div>
            <h3 className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-gray-100">
              {article.title}
            </h3>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {summary}
            </p>
          </div>

          <div className="hide-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
            {article.tags?.slice(0, 3).map((t) => (
              <span
                key={t.id}
                className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-700"
              >
                {t.name}
              </span>
            ))}
            <span className="ml-auto inline-flex items-center gap-1">
              {article.author?.avatar ? (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name || ""}
                  width={16}
                  height={16}
                  className="h-4 w-4 rounded-full object-cover"
                />
              ) : (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-[10px] text-white">
                  {article.author?.name?.[0] || "U"}
                </span>
              )}
              <span>{article.publishTime}</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function ArticleListPagination({
  current,
  totalPages,
  onChange,
}: {
  current: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-10 flex items-center justify-center gap-2 text-sm">
      <button
        type="button"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className="rounded bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        上一页
      </button>
      <span className="rounded border border-gray-200 bg-white px-4 py-2 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {current} / {totalPages}
      </span>
      <button
        type="button"
        disabled={current === totalPages}
        onClick={() => onChange(current + 1)}
        className="rounded bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        下一页
      </button>
    </div>
  );
}

export function ArticleEmpty({ hint }: { hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 text-4xl">📝</div>
      <p className="text-gray-500">{hint || "暂无文章"}</p>
    </div>
  );
}

export function ArticleError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-gray-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded border border-gray-300 px-4 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          重试
        </button>
      )}
    </div>
  );
}

export function ArticleListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton-shimmer h-32 w-44 shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-shimmer h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="skeleton-shimmer h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="skeleton-shimmer h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { ChevronRight };