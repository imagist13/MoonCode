import { Suspense } from "react";
import ArticleList from "./ArticleList";
import { Hero } from "@/components/blog/Hero";
import { FeaturedCard } from "@/components/blog/FeaturedCard";
import { CategoryList } from "@/components/blog/CategoryList";
import { TagCloud } from "@/components/blog/TagCloud";
import { Skeleton } from "@/components/ui/skeleton";

interface HomePageProps {
  searchParams: Promise<{ categoryId?: string; tagId?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const categoryId = params.categoryId ?? null;
  const tagId = params.tagId ?? null;
  const hasFilter = !!(categoryId || tagId);

  // 仅在无筛选时拉侧边数据（服务端组件）
  const [config, featured] = hasFilter
    ? [null, null]
    : await Promise.all([fetchSiteConfig(), fetchFeatured()]);

  return (
    <div>
      <Hero
        siteName={config?.name}
        slogan={config?.slogan as string | undefined}
        hasFilter={hasFilter}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* 左栏：文章列表 */}
        <main className="min-w-0">
          <Suspense
            fallback={
              <div className="space-y-6">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-32 w-44 shrink-0 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <ArticleList categoryId={categoryId} tagId={tagId} />
          </Suspense>
        </main>

        {/* 右栏：3 块卡片 */}
        {!hasFilter && (
          <aside className="space-y-6">
            <FeaturedCard article={featured} />
            <CategoryList />
            <TagCloud />
          </aside>
        )}
      </div>
    </div>
  );
}

interface SiteConfigShape {
  name?: string;
  slogan?: string;
  [key: string]: unknown;
}

async function fetchSiteConfig(): Promise<SiteConfigShape | null> {
  const base = process.env.BACKEND_URL || "http://localhost:8080";
  try {
    const res = await fetch(`${base}/api/website/config`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const raw = json?.data;
    if (!raw) return null;
    const text = typeof raw === "string" ? raw : JSON.stringify(raw);
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

interface FeaturedArticle {
  id: number;
  articleTitle: string;
  articleCover?: string;
  categoryName?: string;
}

async function fetchFeatured(): Promise<FeaturedArticle | null> {
  const base = process.env.BACKEND_URL || "http://localhost:8080";
  try {
    const params = new URLSearchParams({ current: "1", size: "10" });
    const res = await fetch(
      `${base}/api/articles?${params.toString()}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    type Row = FeaturedArticle & { isTop?: boolean };
    const list: Row[] = json?.data?.records ?? [];
    // 优先取 isTop=true 的；否则取第一条
    const picked = list.find((a) => a.isTop) ?? list[0];
    return picked ?? null;
  } catch {
    return null;
  }
}
