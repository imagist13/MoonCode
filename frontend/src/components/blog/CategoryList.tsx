"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { SideTitle } from "./FeaturedCard";

interface Category {
  id: number;
  categoryName: string;
  articleCount: number;
}

/**
 * 右栏：文章分类（list，每项带左侧品牌色细条）
 */
export function CategoryList() {
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Category[]>("/categories")
      .then((res) => {
        if (res.flag && res.data) setList(res.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside>
      <SideTitle>文章分类</SideTitle>
      <ul className="space-y-1 rounded-lg border border-border/60 bg-card p-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="px-3 py-2">
              <Skeleton className="h-4 w-3/4" />
            </li>
          ))
        ) : error ? (
          <li className="px-3 py-4 text-center text-xs text-muted-foreground">
            加载失败
          </li>
        ) : list.length === 0 ? (
          <li className="px-3 py-4 text-center text-xs text-muted-foreground">
            暂无分类
          </li>
        ) : (
          list.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/?categoryId=${cat.id}`}
                className="group flex items-center justify-between rounded-md px-3 py-2
                           text-sm text-foreground transition-colors
                           hover:bg-brand-50 hover:text-brand-700
                           dark:hover:bg-brand-900/30 dark:hover:text-brand-300"
              >
                <span className="relative pl-3">
                  <span className="absolute left-0 top-1/2 h-3.5 w-0.5 -translate-y-1/2
                                   rounded-full bg-brand-500 transition-all
                                   group-hover:h-4" />
                  {cat.categoryName}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {cat.articleCount}
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
