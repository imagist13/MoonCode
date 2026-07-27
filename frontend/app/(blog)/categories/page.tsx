import type { Metadata } from "next";
import { categories } from "@/lib/api/categories";
import { CategoryPill } from "@/components/blog/category-pill";
import type { Category } from "@/types/category";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Categories",
  description: "所有分类。",
};

export default async function CategoriesPage() {
  let list: Category[] = [];
  try {
    list = (await categories.list({ revalidate: 120 })) ?? [];
  } catch {
    list = [];
  }
  return (
    <>
      <header className="mb-12">
        <div className="label-mono text-muted-foreground">Index</div>
        <h1 className="mt-3 text-4xl tracking-tight md:text-5xl">
          <span className="display-serif">Categories</span>
        </h1>
      </header>
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无分类。</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {list.map((c) => (
            <CategoryPill key={c.id} category={c} />
          ))}
        </div>
      )}
    </>
  );
}
