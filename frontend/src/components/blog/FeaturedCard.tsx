"use client";

import Link from "next/link";
import Image from "next/image";

export interface FeaturedArticle {
  id: number;
  articleTitle: string;
  articleCover?: string;
  categoryName?: string;
}

/**
 * 右栏：今日推荐
 * 单张大幅封面 + 底部渐变 + 标题叠在封面上
 */
export function FeaturedCard({ article }: { article: FeaturedArticle | null }) {
  if (!article) {
    return (
      <aside className="overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
          暂无推荐内容
        </div>
      </aside>
    );
  }

  return (
    <aside>
      <SideTitle>今日推荐</SideTitle>
      <Link
        href={`/articles/${article.id}`}
        className="group relative block overflow-hidden rounded-lg
                   border border-border/60 shadow-sm
                   transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-card)"
      >
        {article.articleCover ? (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={article.articleCover}
              alt={article.articleTitle}
              fill
              sizes="300px"
              className="object-cover transition-transform duration-500
                         group-hover:scale-105"
            />
            {/* 顶部轻雾 */}
            <div className="absolute inset-0
                            bg-linear-to-t from-black/65 via-black/15 to-transparent" />
            {/* 左上小条 */}
            <div className="absolute left-3 top-3 rounded bg-white/85 px-1.5 py-0.5
                            text-[10px] font-medium tracking-widest text-brand-700
                            backdrop-blur-sm">
              RECOMMEND
            </div>
            {/* 底部标题 */}
            <div className="absolute inset-x-0 bottom-0 p-4">
              {article.categoryName && (
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-brand-300">
                  {article.categoryName}
                </div>
              )}
              <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white
                             drop-shadow-sm transition-colors">
                {article.articleTitle}
              </h3>
            </div>
          </div>
        ) : (
          <div className="flex aspect-video flex-col justify-end bg-linear-to-br
                          from-brand-100 via-brand-50 to-purple-100 p-4
                          dark:from-brand-900/40 dark:via-brand-800/20 dark:to-purple-900/30">
            {article.categoryName && (
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-brand-700
                              dark:text-brand-300">
                {article.categoryName}
              </div>
            )}
            <h3 className="line-clamp-2 text-base font-semibold leading-snug">
              {article.articleTitle}
            </h3>
          </div>
        )}
      </Link>
    </aside>
  );
}

export function SideTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
      <span className="inline-block h-4 w-0.5 rounded-full bg-brand-500" />
      {children}
    </h3>
  );
}
