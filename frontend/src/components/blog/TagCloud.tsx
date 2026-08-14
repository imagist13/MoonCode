"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { SideTitle } from "./FeaturedCard";

interface Tag {
  id: number;
  tagName: string;
  articleCount: number;
}

/**
 * 右栏：文章标签（彩色小标签云）
 * 字号 + 色深 与文章数量挂钩
 */
export function TagCloud() {
  const [list, setList] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Tag[]>("/tags")
      .then((res) => {
        if (res.flag && res.data) setList(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const max = Math.max(...list.map((t) => t.articleCount), 1);

  return (
    <aside>
      <SideTitle>文章标签</SideTitle>
      <div className="rounded-lg border border-border/60 bg-card p-3">
        {loading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-14 rounded-full" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">暂无标签</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {list.map((t) => {
              const ratio = t.articleCount / max;
              const sizeClass =
                ratio > 0.75
                  ? "text-base px-3 py-1"
                  : ratio > 0.5
                    ? "text-sm px-2.5 py-0.5"
                    : "text-xs px-2 py-0.5";
              const colorClass =
                ratio > 0.75
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-900/60";
              return (
                <Link
                  key={t.id}
                  href={`/?tagId=${t.id}`}
                  className={`inline-flex items-center rounded-full font-medium
                              transition-all hover:-translate-y-0.5 ${sizeClass} ${colorClass}`}
                >
                  <span>{t.tagName}</span>
                  <span className={`ml-1 ${ratio > 0.75 ? "opacity-80" : "opacity-60"}`}>
                    ({t.articleCount})
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
