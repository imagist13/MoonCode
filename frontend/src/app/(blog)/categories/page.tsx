"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import {
  CategoryFolderGrid,
  type CategoryFolderItem,
} from "@/components/blog/CategoryFolderGrid";
import { api } from "@/lib/api";

interface CategoryRecord {
  id: number;
  categoryName: string;
  articleCount: number;
}

interface ArticleRecord {
  id: number;
  articleTitle: string;
  articleCover?: string | null;
  createTime?: string | null;
}

interface ArticlePage {
  records?: ArticleRecord[];
  count?: number;
}

const LATEST_PER_FOLDER = 4;

export default function CategoriesPage() {
  const [items, setItems] = useState<CategoryFolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get<CategoryRecord[]>("/categories");
        if (!res.flag || !res.data) {
          throw new Error(res.message || "加载失败");
        }

        const categories = await Promise.all(
          res.data.map(async (category): Promise<CategoryFolderItem> => {
            const base: CategoryFolderItem = {
              id: category.id,
              name: category.categoryName,
              count: category.articleCount,
              articles: [],
            };
            try {
              const page = await api.get<ArticlePage>(
                `/articles?current=1&size=${LATEST_PER_FOLDER}&categoryId=${category.id}`,
              );
              const records = page.data?.records ?? [];
              return {
                ...base,
                articles: records.map((article) => ({
                  id: article.id,
                  title: article.articleTitle,
                  cover: article.articleCover || undefined,
                  time: article.createTime || undefined,
                })),
              };
            } catch {
              return base;
            }
          }),
        );

        if (!cancelled) setItems(categories);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载失败");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">分类</h1>
        <div className="flex flex-wrap justify-center gap-x-14 gap-y-18 py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[326px] w-full max-w-[340px] rounded-3xl"
            />
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
        description={
          items.length > 0
            ? `共 ${items.length} 个分类 · 点击文件夹展开最新文章`
            : "共 0 个分类"
        }
      />

      {items.length === 0 ? (
        <p className="text-center text-gray-400">暂无分类</p>
      ) : (
        <CategoryFolderGrid items={items} />
      )}
    </div>
  );
}
