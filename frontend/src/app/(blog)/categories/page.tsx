"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        title="分类"
        description={`共 ${categories.length} 个分类`}
      />

      {categories.length === 0 ? (
        <p className="text-center text-gray-400">暂无分类</p>
      ) : (
        <ul className="divide-y divide-gray-100 border-y border-gray-100 dark:divide-gray-800 dark:border-gray-800">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/?categoryId=${cat.id}`}
                className="group flex items-center justify-between px-2 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <span className="text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100">
                  {cat.categoryName}
                </span>
                <span className="text-sm text-gray-400 tabular-nums">
                  {cat.articleCount} 篇
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
