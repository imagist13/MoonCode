"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
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

/** 字号档位越大，颜色越深（用中性灰，避免过重） */
const colorClasses = [
  "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300",
  "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
  "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100",
  "text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100",
  "text-gray-900 hover:text-black dark:text-gray-100 dark:hover:text-white",
];

const bgClasses = [
  "bg-transparent",
  "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800",
  "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
  "bg-gray-200/70 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
  "bg-gray-300/60 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500",
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
      <PageHeader
        title="标签"
        description={`共 ${tags.length} 个标签 · 字号反映文章数量`}
      />

      <div className="flex flex-wrap items-center gap-3">
        {tags.map((tag) => {
          const level = getSizeLevel(tag.articleCount, maxCount);
          return (
            <a
              key={tag.id}
              href={`/?tagId=${tag.id}`}
              className={`inline-flex items-center gap-1 rounded-md
                          transition-colors duration-200 ${sizeClasses[level]} ${colorClasses[level]} ${bgClasses[level]}`}
            >
              <span>{tag.tagName}</span>
              <span className="opacity-60">({tag.articleCount})</span>
            </a>
          );
        })}

        {tags.length === 0 && (
          <p className="w-full text-center text-gray-400">暂无标签</p>
        )}
      </div>
    </div>
  );
}
