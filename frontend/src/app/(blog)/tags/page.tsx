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
        <div className="flex flex-wrap gap-x-8 gap-y-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-24" />
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

  const sorted = [...tags].sort(
    (a, b) =>
      b.articleCount - a.articleCount ||
      a.tagName.localeCompare(b.tagName, "zh-Hans-CN"),
  );

  return (
    <div>
      <PageHeader
        title="标签"
        description={`共 ${tags.length} 个标签 · 按文章数量排序`}
      />

      <div className="flex max-w-4xl flex-wrap items-baseline gap-x-10 gap-y-7 sm:gap-x-24">
        {sorted.map((tag) => (
          <a
            key={tag.id}
            href={`/?tagId=${tag.id}`}
            aria-label={`${tag.tagName}，${tag.articleCount} 篇文章`}
            className="group inline-flex items-baseline gap-1 border-b border-dashed border-blog-line pb-1.5 text-[19px] text-blog-ink transition-colors hover:border-blog-ink"
          >
            <span
              aria-hidden="true"
              className="text-blog-soft/50 transition-colors group-hover:text-blog-ink"
            >
              #
            </span>
            <span>{tag.tagName}</span>
            <sup className="ml-0.5 font-mono text-[11px] text-blog-soft/50 transition-colors group-hover:text-blog-ink">
              {tag.articleCount}
            </sup>
          </a>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="py-10 text-center text-[13px] text-blog-soft">暂无标签</p>
      )}
    </div>
  );
}
