"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface Category {
  id: number;
  categoryName: string;
  articleCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Category[]>("/categories")
      .then((res) => {
        if (res.flag && res.data) {
          setCategories(res.data);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">分类</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
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
              分类
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            共 {categories.length} 个分类
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/?categoryId=${cat.id}`} className="group">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg transition-colors
                                         group-hover:text-brand-600
                                         dark:group-hover:text-brand-400">
                    {cat.categoryName}
                  </CardTitle>
                  <span className="inline-flex h-7 items-center rounded-full
                                   bg-brand-50 px-2.5 text-xs font-medium text-brand-700
                                   dark:bg-brand-900/40 dark:text-brand-300">
                    {cat.articleCount}
                  </span>
                </div>
                <CardDescription>
                  点击查看该分类下的全部文章
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}

        {categories.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            暂无分类
          </p>
        )}
      </div>
    </div>
  );
}
