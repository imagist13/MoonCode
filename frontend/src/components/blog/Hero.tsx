"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PinnedArticle {
  id: number;
  articleTitle: string;
  articleCover?: string;
  categoryName?: string;
  articleContent?: string;
}

interface HeroProps {
  siteName?: string;
  slogan?: string;
  pinned?: PinnedArticle | null;
  hasFilter?: boolean;
}

function stripMarkdown(s: string): string {
  return s.replace(/[#*`>\-\[\]()_~]/g, "").replace(/\s+/g, " ").trim();
}

export function Hero({ siteName, slogan, pinned, hasFilter }: HeroProps) {
  if (hasFilter) {
    return (
      <section className="relative mb-12 overflow-hidden rounded-2xl border border-border/60
                          bg-linear-to-br from-brand-50 via-background to-purple-50/40
                          dark:from-brand-900/20 dark:via-background dark:to-purple-900/10
                          px-6 py-12 text-center md:px-12 md:py-16">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full
                        bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full
                        bg-purple-400/15 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            文章筛选
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            按条件筛选的文章列表
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mb-12 overflow-hidden rounded-2xl border border-border/60
                        bg-linear-to-br from-brand-50 via-background to-purple-50/40
                        dark:from-brand-900/20 dark:via-background dark:to-purple-900/10
                        px-6 py-12 md:px-12 md:py-16">
      {/* 装饰光斑 */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full
                      bg-brand-400/25 blur-3xl dark:bg-brand-500/15" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full
                      bg-purple-400/15 blur-3xl" />
      <div className="pointer-events-none hidden dark:block absolute top-1/2 left-1/2
                      h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full
                      bg-brand-500/8 blur-3xl animate-pulse" />

      <div className="relative">
        {/* 顶部小标签 */}
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-200
                        bg-brand-50/80 px-3 py-1 text-xs font-medium text-brand-700
                        backdrop-blur-sm dark:border-brand-700/40 dark:bg-brand-900/30 dark:text-brand-300">
          <Sparkles className="h-3 w-3" />
          <span>欢迎来访</span>
        </div>

        {/* 主标题 */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span
            className="bg-linear-to-r from-brand-500 via-brand-600 to-purple-500
                       bg-clip-text text-transparent"
          >
            {siteName || "我的博客"}
          </span>
        </h1>

        {/* 副标题 */}
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {slogan || "记录技术、分享生活。一处安静写字的小角落。"}
        </p>

        {/* 置顶文章大卡 */}
        {pinned && (
          <Link
            href={`/articles/${pinned.id}`}
            className="group mt-10 block overflow-hidden rounded-xl border border-border/60
                       bg-card text-left shadow-(--shadow-card)
                       transition-all duration-300 hover:-translate-y-1
                       hover:shadow-(--shadow-card-hover)"
          >
            <div className="grid gap-0 md:grid-cols-2">
              {pinned.articleCover ? (
                <div className="relative aspect-video overflow-hidden md:aspect-auto md:h-full">
                  <Image
                    src={pinned.articleCover}
                    alt={pinned.articleTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500
                               group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-tr
                                  from-brand-900/30 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="hidden md:block relative aspect-video
                                bg-linear-to-br from-brand-100 via-brand-50 to-purple-100
                                dark:from-brand-900/40 dark:via-brand-800/20 dark:to-purple-900/30" />
              )}

              <div className="flex flex-col justify-center p-6 md:p-8">
                <div className="flex items-center gap-2">
                  <Badge className="bg-brand-500 text-white hover:bg-brand-500">
                    <Sparkles className="mr-1 h-3 w-3" />
                    置顶推荐
                  </Badge>
                  {pinned.categoryName && (
                    <Badge variant="secondary">{pinned.categoryName}</Badge>
                  )}
                </div>
                <h2 className="mt-4 text-2xl font-bold leading-tight md:text-3xl">
                  {pinned.articleTitle}
                </h2>
                {pinned.articleContent && (
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground md:text-base">
                    {stripMarkdown(pinned.articleContent).slice(0, 160)}
                  </p>
                )}
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium
                                text-brand-600 transition-all group-hover:gap-2.5
                                dark:text-brand-400">
                  阅读全文
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
