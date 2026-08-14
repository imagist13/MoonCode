import { Suspense } from "react";
import ArticleList from "./ArticleList";
import { Hero } from "@/components/blog/Hero";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteConfig } from "@/hooks/useSiteConfig";

interface HomePageProps {
  searchParams: Promise<{ categoryId?: string; tagId?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const categoryId = params.categoryId ?? null;
  const tagId = params.tagId ?? null;
  const hasFilter = !!(categoryId || tagId);

  return (
    <div>
      <HeroSection
        hasFilter={hasFilter}
        categoryId={categoryId}
        tagId={tagId}
      />

      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        }
      >
        <ArticleList categoryId={categoryId} tagId={tagId} />
      </Suspense>
    </div>
  );
}

/**
 * 服务端 hero 区块：
 * - 没有筛选时拉取置顶文章（isTop=true）
 * - 有筛选时显示筛选提示
 */
async function HeroSection({
  hasFilter,
  categoryId,
  tagId,
}: {
  hasFilter: boolean;
  categoryId: string | null;
  tagId: string | null;
}) {
  const config = await fetchSiteConfig();
  const pinned = hasFilter ? null : await fetchPinnedArticle();

  return (
    <Hero
      siteName={config?.name}
      slogan={config?.slogan as string | undefined}
      pinned={pinned}
      hasFilter={hasFilter}
    />
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

interface PinnedArticle {
  id: number;
  articleTitle: string;
  articleCover?: string;
  categoryName?: string;
  articleContent?: string;
}

async function fetchPinnedArticle(): Promise<PinnedArticle | null> {
  const base = process.env.BACKEND_URL || "http://localhost:8080";
  try {
    const params = new URLSearchParams({ current: "1", size: "10" });
    const res = await fetch(
      `${base}/api/articles?${params.toString()}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const list: (PinnedArticle & { isTop?: boolean })[] =
      json?.data?.records ?? [];
    // 优先取 isTop=true 的；没有则取最新一条
    const pinned = list.find((a) => a.isTop) ?? list[0];
    if (!pinned) return null;
    return {
      id: pinned.id,
      articleTitle: pinned.articleTitle,
      articleCover: pinned.articleCover,
      categoryName: pinned.categoryName,
      articleContent: pinned.articleContent,
    };
  } catch {
    return null;
  }
}
