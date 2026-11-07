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
  "px-2.5 py-1 text-[12px]",
  "px-3 py-1 text-[13px]",
  "px-3.5 py-1.5 text-[15px]",
  "px-4 py-1.5 text-[17px]",
  "px-4 py-2 text-[19px]",
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
        <h1 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-blog-ink">
          标签
        </h1>
        <div className="flex flex-wrap gap-2.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
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

  const maxCount = Math.max(...tags.map((t) => t.articleCount), 1);

  return (
    <div>
      <PageHeader
        title="标签"
        description={`共 ${tags.length} 个标签 · 字号反映文章数量`}
      />

      <div className="flex flex-wrap items-center gap-2.5">
        {tags.map((tag) => {
          const level = getSizeLevel(tag.articleCount, maxCount);
          return (
            <a
              key={tag.id}
              href={`/?tagId=${tag.id}`}
              className={`inline-flex items-center gap-1.5 rounded-full border border-blog-line text-blog-soft
                          transition-colors duration-200 hover:border-blog-ink hover:text-blog-ink
                          ${sizeClasses[level]}`}
            >
              <span>{tag.tagName}</span>
              <span className="font-mono text-[0.72em] opacity-60">
                {tag.articleCount}
              </span>
            </a>
          );
        })}

        {tags.length === 0 && (
          <p className="w-full py-10 text-center text-[13px] text-blog-soft">
            暂无标签
          </p>
        )}
      </div>
    </div>
  );
}
