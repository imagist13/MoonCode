import { Suspense } from "react";
import ArticleList from "./ArticleList";
import { Hero, type HeroPinned } from "@/components/blog/Hero";

interface HomePageProps {
  searchParams: Promise<{ category?: string; tag?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const hasFilter = !!(params.category || params.tag);

  // 仅在无筛选时拉侧边数据（服务端组件）
  const [config, featured] = hasFilter
    ? [null, null]
    : await Promise.all([fetchSiteConfig(), fetchFeatured()]);

  return (
    <div>
      <Hero
        siteName={config?.name}
        slogan={config?.slogan as string | undefined}
        pinned={featured as HeroPinned | null}
        hasFilter={hasFilter}
      />

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-sm text-gray-500">
            加载中...
          </div>
        }
      >
        <ArticleList />
      </Suspense>
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
    const picked = list.find((a) => a.isTop) ?? list[0];
    return picked ?? null;
  } catch {
    return null;
  }
}