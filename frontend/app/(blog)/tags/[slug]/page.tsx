import { notFound } from "next/navigation";
import { MainGrid } from "@/components/layout/main-grid";
import { HomeSidebar } from "@/components/sidebar/home-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Pagination } from "@/components/post/pagination";
import { listArticles } from "@/lib/api/articles";
import { listTags } from "@/lib/api/tags";

const PAGE_SIZE = 9;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));

  const [tags, data] = await Promise.allSettled([
    listTags(),
    listArticles({ page, pageSize: PAGE_SIZE, tag: slug, status: "published" }),
  ]);
  const tag = tags.status === "fulfilled" ? tags.value.find((t) => t.slug === slug) : null;
  if (!tag) return notFound();

  const articles =
    data.status === "fulfilled"
      ? data.value
      : { items: [], total: 0, page, pageSize: PAGE_SIZE };

  return (
    <MainGrid sidebar={<HomeSidebar />}>
      <header className="mb-6 rounded-xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">标签</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">#{tag.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          共 {articles.total} 篇文章
        </p>
      </header>
      {articles.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          该标签下还没有文章。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {articles.items.map((a) => (
            <PostCard key={a.id} article={a} />
          ))}
        </div>
      )}
      <Pagination
        page={articles.page}
        pageSize={articles.pageSize}
        total={articles.total}
        basePath={`/tags/${slug}`}
        className="mt-8"
      />
    </MainGrid>
  );
}