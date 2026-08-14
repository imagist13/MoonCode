"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface ArchiveArticle {
  id: number;
  articleTitle: string;
  createTime: string;
}

interface PageResult {
  records: ArchiveArticle[];
  count: number;
}

/** 按年月分组归档文章 */
function groupByYearMonth(articles: ArchiveArticle[]) {
  const groups: Record<string, ArchiveArticle[]> = {};

  for (const article of articles) {
    const date = new Date(article.createTime);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(article);
  }

  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

export default function ArchivesPage() {
  const [articles, setArticles] = useState<ArchiveArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<PageResult>("/articles/archives?current=1&size=50")
      .then((res) => {
        if (res.flag && res.data) {
          setArticles(res.data.records || []);
          setTotal(res.data.count ?? res.data.records?.length ?? 0);
        }
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">归档</h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>加载失败: {error}</p>
      </div>
    );
  }

  const grouped = groupByYearMonth(articles);

  return (
    <div>
      <div className="relative mb-10 overflow-hidden rounded-2xl border border-border/60
                      bg-linear-to-br from-brand-50 via-background to-purple-50/30
                      dark:from-brand-900/20 dark:via-background dark:to-purple-900/10
                      px-6 py-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48
                        rounded-full bg-brand-400/20 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-linear-to-r from-brand-500 via-brand-600 to-purple-500
                             bg-clip-text text-transparent">
              文章归档
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            共 {total} 篇文章 · 按时间倒序
          </p>
        </div>
      </div>

      <div className="space-y-10">
        {grouped.map(([yearMonth, items]) => {
          const [year, month] = yearMonth.split("-");
          return (
            <section key={yearMonth}>
              <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold">
                <span className="inline-block h-6 w-1 rounded-full bg-linear-to-b from-brand-400 to-brand-600" />
                {year} 年 {parseInt(month, 10)} 月
                <span className="text-sm font-normal text-muted-foreground">
                  ({items.length})
                </span>
              </h2>

              <div className="relative border-l-2 border-brand-200/60 pl-6 dark:border-brand-900/40">
                {items.map((article) => {
                  const date = new Date(article.createTime);
                  const day = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                  return (
                    <div key={article.id} className="group relative mb-4 last:mb-0">
                      <span className="absolute -left-7.75 top-1.5 h-3 w-3 rounded-full
                                       border-2 border-brand-500 bg-background
                                       transition-all duration-200
                                       group-hover:scale-125 group-hover:bg-brand-500
                                       group-hover:shadow-[0_0_0_4px_rgb(59_130_246/0.18)]" />
                      <div className="flex items-baseline gap-3 rounded-md
                                      px-2 py-1 -mx-2 transition-colors
                                      group-hover:bg-brand-50/60
                                      dark:group-hover:bg-brand-900/20">
                        <time className="shrink-0 font-mono text-sm text-muted-foreground tabular-nums">
                          {day}
                        </time>
                        <Link
                          href={`/articles/${article.id}`}
                          className="text-foreground transition-colors group-hover:text-brand-600
                                     dark:group-hover:text-brand-400"
                        >
                          {article.articleTitle}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {grouped.length === 0 && (
          <p className="text-center text-muted-foreground">暂无归档文章</p>
        )}
      </div>
    </div>
  );
}
