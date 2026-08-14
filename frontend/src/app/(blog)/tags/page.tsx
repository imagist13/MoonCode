"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface Tag {
  id: number;
  tagName: string;
  articleCount: number;
}

/** 根据文章数量计算标签大小等级 (0-4) */
function getSizeLevel(count: number, maxCount: number): number {
  if (maxCount <= 0) return 0;
  const ratio = count / maxCount;
  if (ratio > 0.8) return 4;
  if (ratio > 0.6) return 3;
  if (ratio > 0.4) return 2;
  if (ratio > 0.2) return 1;
  return 0;
}

const sizeClasses = [
  "text-xs px-2 py-0.5",
  "text-sm px-2.5 py-0.5",
  "text-base px-3 py-1",
  "text-lg px-3.5 py-1",
  "text-xl px-4 py-1.5",
];

/** 字号档位越大，色相越深（最多 brand-700） */
const colorClasses = [
  "text-muted-foreground hover:text-brand-500",
  "text-brand-500/80 hover:text-brand-600",
  "text-brand-500 hover:text-brand-700",
  "text-brand-600 hover:text-brand-700",
  "text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200",
];

const bgClasses = [
  "bg-transparent",
  "bg-brand-50/60 hover:bg-brand-50 dark:bg-transparent dark:hover:bg-brand-900/30",
  "bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50",
  "bg-brand-100 hover:bg-brand-200 dark:bg-brand-900/40 dark:hover:bg-brand-900/60",
  "bg-brand-200/70 hover:bg-brand-200 dark:bg-brand-800/40 dark:hover:bg-brand-800/60",
];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Tag[]>("/tags")
      .then((res) => {
        if (res.flag && res.data) {
          setTags(res.data);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">标签</h1>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
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

  const maxCount = Math.max(...tags.map((t) => t.articleCount), 1);

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-border/60
                      bg-linear-to-br from-brand-50 via-background to-purple-50/30
                      dark:from-brand-900/20 dark:via-background dark:to-purple-900/10
                      px-6 py-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48
                        rounded-full bg-brand-400/20 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-linear-to-r from-brand-500 via-brand-600 to-purple-500
                             bg-clip-text text-transparent">
              标签云
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            共 {tags.length} 个标签 · 字号与色相反映文章数量
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {tags.map((tag) => {
          const level = getSizeLevel(tag.articleCount, maxCount);
          return (
            <a
              key={tag.id}
              href={`/?tagId=${tag.id}`}
              className={`inline-flex items-center gap-1 rounded-full border border-transparent
                          font-medium transition-all duration-200
                          hover:-translate-y-0.5 hover:shadow-sm ${sizeClasses[level]} ${colorClasses[level]} ${bgClasses[level]}`}
            >
              <span>{tag.tagName}</span>
              <span className="opacity-60">({tag.articleCount})</span>
            </a>
          );
        })}

        {tags.length === 0 && (
          <p className="w-full text-center text-muted-foreground">暂无标签</p>
        )}
      </div>
    </div>
  );
}
