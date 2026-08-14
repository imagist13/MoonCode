"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Calendar, Tag, Folder } from "lucide-react";
import { api } from "@/lib/api";

interface TagBrief {
  id: number;
  tagName: string;
}

interface Article {
  id: number;
  articleCover: string;
  articleTitle: string;
  articleContent: string;
  isTop: boolean;
  type: number;
  createTime: string;
  categoryName: string;
  tagVOList: TagBrief[];
}

interface PageResult {
  records: Article[];
  count: number;
}

interface ArticleListProps {
  categoryId?: string | null;
  tagId?: string | null;
}

const PAGE_SIZE = 10;

function stripMarkdown(s: string): string {
  return (s || "")
    .replace(/[#*`>\-\[\]()_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ArticleList({
  categoryId,
  tagId,
}: ArticleListProps = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCover, setShowCover] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setCurrent(1);
    fetchArticles(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, tagId]);

  function fetchArticles(page: number) {
    const thisRequest = ++requestIdRef.current;

    setLoading(true);
    setError("");

    const hasFilter = categoryId || tagId;
    const params = new URLSearchParams({
      current: String(page),
      size: String(PAGE_SIZE),
    });
    if (categoryId) params.set("categoryId", categoryId);
    if (tagId) params.set("tagId", tagId);

    const endpoint = hasFilter
      ? `/articles/condition?${params.toString()}`
      : `/articles?${params.toString()}`;

    api
      .get<PageResult>(endpoint)
      .then((res) => {
        if (thisRequest !== requestIdRef.current) return;
        if (res.flag && res.data) {
          setArticles(res.data.records || []);
          setTotal(res.data.count ?? 0);
        }
      })
      .catch((err: unknown) => {
        if (thisRequest !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : "加载失败");
      })
      .finally(() => {
        if (thisRequest === requestIdRef.current) {
          setLoading(false);
        }
      });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-32 w-44 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
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

  if (articles.length === 0) {
    return (
      <p className="text-center text-muted-foreground">暂无文章</p>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* 列表头：标题 + 显示图片开关 */}
      <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-3">
        <h2 className="text-base font-semibold tracking-tight">
          {categoryId || tagId ? "文章筛选" : "最新推荐"}
        </h2>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <span>显示图片</span>
          <span
            role="switch"
            aria-checked={showCover}
            tabIndex={0}
            onClick={() => setShowCover((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setShowCover((v) => !v);
              }
            }}
            className={`relative inline-block h-4 w-7 rounded-full transition-colors ${
              showCover ? "bg-brand-500" : "bg-muted-foreground/40"
            }`}
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm
                          transition-all duration-200 ${
                            showCover ? "left-3.5" : "left-0.5"
                          }`}
            />
          </span>
        </label>
      </div>

      <div className="space-y-6">
        {articles.map((article) => {
          const coverUrl = showCover ? article.articleCover : "";
          return (
            <Link
              key={article.id}
              href={`/articles/${article.id}`}
              className="group block"
            >
              <article
                className={`group flex gap-5 rounded-lg border border-transparent
                            px-3 py-3 transition-all duration-200
                            hover:-translate-y-0.5 hover:border-border/60 hover:bg-card
                            hover:shadow-(--shadow-card)
                            dark:hover:bg-card/40`}
              >
                {/* 左侧封面 */}
                {coverUrl ? (
                  <div className="relative aspect-video w-44 shrink-0 overflow-hidden
                                  rounded-lg bg-muted">
                    <Image
                      src={coverUrl}
                      alt={article.articleTitle}
                      fill
                      sizes="176px"
                      className="object-cover transition-transform duration-500
                                 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="hidden w-44 shrink-0 sm:block" />
                )}

                {/* 右侧内容 */}
                <div className="flex min-w-0 flex-1 flex-col">
                  {/* 顶部小标签 */}
                  <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
                    {article.isTop && (
                      <span className="rounded bg-brand-500 px-1.5 py-0.5 font-medium text-white">
                        置顶
                      </span>
                    )}
                    {article.categoryName && (
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 font-medium text-brand-700
                                       dark:bg-brand-900/30 dark:text-brand-300">
                        {article.categoryName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {article.createTime}
                    </span>
                  </div>

                  {/* 标题 */}
                  <h3 className="line-clamp-2 text-base font-semibold leading-snug
                                 transition-colors group-hover:text-brand-600
                                 dark:group-hover:text-brand-400">
                    {article.articleTitle}
                  </h3>

                  {/* 摘要 */}
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {stripMarkdown(article.articleContent).slice(0, 140)}
                  </p>

                  {/* 底部：标签 */}
                  {article.tagVOList && article.tagVOList.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      {article.tagVOList.slice(0, 3).map((t) => (
                        <span key={t.id} className="hover:text-brand-600">
                          {t.tagName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={current === 1}
            onClick={() => {
              const p = current - 1;
              setCurrent(p);
              fetchArticles(p);
            }}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            {current} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={current === totalPages}
            onClick={() => {
              const p = current + 1;
              setCurrent(p);
              fetchArticles(p);
            }}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
