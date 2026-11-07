"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
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
        <h1 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-blog-ink">
          归档
        </h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[13px] text-blog-soft">
        <p>加载失败: {error}</p>
      </div>
    );
  }

  const grouped = groupByYearMonth(articles);

  return (
    <div>
      <PageHeader
        title="归档"
        description={`共 ${total} 篇文章 · 按时间倒序`}
      />

      <div className="space-y-10">
        {grouped.map(([yearMonth, items]) => {
          const [year, month] = yearMonth.split("-");
          return (
            <section key={yearMonth}>
              <h2 className="mb-4 flex items-baseline gap-2 text-[15px] font-semibold text-blog-ink">
                {year} 年 {parseInt(month, 10)} 月
                <span className="font-mono text-[11px] font-normal text-blog-soft">
                  ({items.length})
                </span>
              </h2>

              <ul className="divide-y divide-blog-line border-y border-blog-line">
                {items.map((article) => {
                  const date = new Date(article.createTime);
                  const day = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                  return (
                    <li key={article.id} className="group">
                      <Link
                        href={`/articles/${article.id}`}
                        className="flex items-baseline gap-4 px-2 py-3 transition-colors hover:bg-blog-muted"
                      >
                        <time className="shrink-0 font-mono text-[12px] tabular-nums text-blog-soft">
                          {day}
                        </time>
                        <span className="text-[13.5px] text-blog-soft transition-colors group-hover:text-blog-ink">
                          {article.articleTitle}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {grouped.length === 0 && (
          <p className="py-10 text-center text-[13px] text-blog-soft">
            暂无归档文章
          </p>
        )}
      </div>
    </div>
  );
}
