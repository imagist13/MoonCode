"use client";

import Link from "next/link";
import Image from "next/image";
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
  /** 列表序号，用于入场编排 */
  index?: number;
  className?: string;
}

/**
 * 文章卡片（博客前台）
 *  - 桌面：无边框、无阴影的「封面 + 文字」结构
 *  - 移动：横排缩略图 + 标题
 *  - hover 只做封面轻微放大与标题降透明度
 */
export function ArticleCard({
  article,
  forceMobile = false,
  hideCover = false,
  index = 0,
  className,
}: ArticleCardProps) {
  const summary =
    article.summary ?? stripMarkdown(article.content ?? "").slice(0, 140);
  const delay = { animationDelay: `${Math.min(index, 9) * 55}ms` };

  if (forceMobile) {
    return (
      <MobileCard
        article={article}
        summary={summary}
        hideCover={hideCover}
        className={className}
        delay={delay}
      />
    );
  }

  return (
    <Link href={`/articles/${article.id}`} className="block">
      <article
        className={cn(
          "blog-reveal group flex flex-col",
          hideCover && "border-t border-blog-line pt-5",
          className,
        )}
        style={delay}
      >
        {!hideCover && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-blog-muted">
            {article.cover ? (
              <Image
                src={article.cover}
                alt={article.title}
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-[0.18em] text-blog-soft/70 uppercase">
                No Cover
              </span>
            )}
            {article.isTop && (
              <span className="absolute top-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-white backdrop-blur-md">
                置顶
              </span>
            )}
          </div>
        )}

        <div className="flex flex-1 flex-col pt-4">
          {article.categoryName && (
            <span className="text-[10.5px] font-medium tracking-[0.16em] text-blog-soft uppercase">
              {article.categoryName}
            </span>
          )}

          <h3 className="mt-2 line-clamp-2 text-[17px] leading-snug font-semibold tracking-[-0.012em] text-blog-ink transition-opacity duration-300 group-hover:opacity-60">
            {safeTruncate(article.title, 40)}
          </h3>

          <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-blog-soft">
            {summary}
          </p>

          {(article.publishTime || article.viewCount !== undefined) && (
            <div className="mt-4 flex items-center gap-3 text-[11px] tracking-[0.04em] text-blog-soft">
              {article.publishTime && <span>{article.publishTime}</span>}
              {article.publishTime && article.viewCount !== undefined && (
                <span className="h-3 w-px bg-blog-line" />
              )}
              {article.viewCount !== undefined && (
                <span>{formatViews(article.viewCount)} 阅读</span>
              )}
            </div>
          )}
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
  delay,
}: {
  article: ArticleCardData;
  summary: string;
  hideCover: boolean;
  className?: string;
  delay: React.CSSProperties;
}) {
  return (
    <Link href={`/articles/${article.id}`} className="block">
      <article
        className={cn(
          "blog-reveal group flex gap-4",
          hideCover && "border-t border-blog-line pt-4",
          className,
        )}
        style={delay}
      >
        {!hideCover && article.cover && (
          <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-blog-muted">
            <Image
              src={article.cover}
              alt={article.title}
              fill
              sizes="112px"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {article.categoryName && (
            <span className="text-[10px] font-medium tracking-[0.16em] text-blog-soft uppercase">
              {article.categoryName}
            </span>
          )}
          <h3 className="mt-1.5 line-clamp-2 text-[15px] leading-snug font-semibold tracking-[-0.01em] text-blog-ink">
            {article.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-blog-soft">
            {summary}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-blog-soft">
            {article.isTop && (
              <span className="tracking-[0.08em] text-blog-ink">置顶</span>
            )}
            {article.publishTime && <span>{article.publishTime}</span>}
            {article.viewCount !== undefined && (
              <>
                <span className="h-3 w-px bg-blog-line" />
                <span>{formatViews(article.viewCount)} 阅读</span>
              </>
            )}
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
    <div className="mt-16 flex items-center justify-between border-t border-blog-line pt-6 text-[13px]">
      <button
        type="button"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className="text-blog-soft transition-colors hover:text-blog-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-blog-soft"
      >
        ← 上一页
      </button>
      <span className="font-mono text-[11px] tracking-[0.12em] text-blog-soft">
        {current} / {totalPages}
      </span>
      <button
        type="button"
        disabled={current === totalPages}
        onClick={() => onChange(current + 1)}
        className="text-blog-soft transition-colors hover:text-blog-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-blog-soft"
      >
        下一页 →
      </button>
    </div>
  );
}

export function ArticleEmpty({ hint }: { hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center border-t border-blog-line py-20 text-center">
      <p className="text-sm text-blog-soft">{hint || "暂无文章"}</p>
    </div>
  );
}

export function ArticleError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border-t border-blog-line py-20 text-center">
      <p className="text-sm text-blog-soft">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-blog-line px-4 py-1.5 text-[13px] text-blog-ink transition-colors hover:bg-blog-muted"
        >
          重试
        </button>
      )}
    </div>
  );
}

export function ArticleListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid w-full gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col">
          <div className="skeleton-shimmer aspect-[16/10] w-full rounded-xl bg-blog-muted" />
          <div className="flex-1 space-y-2 pt-4">
            <div className="skeleton-shimmer h-3 w-16 rounded bg-blog-muted" />
            <div className="skeleton-shimmer h-5 w-3/4 rounded bg-blog-muted" />
            <div className="skeleton-shimmer h-4 w-full rounded bg-blog-muted" />
            <div className="skeleton-shimmer h-4 w-1/2 rounded bg-blog-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
