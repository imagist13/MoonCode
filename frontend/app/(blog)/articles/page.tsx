import { MainGrid } from "@/components/layout/main-grid";
import { HomeSidebar } from "@/components/sidebar/home-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Pagination } from "@/components/post/pagination";
import { listArticles } from "@/lib/api/articles";

const PAGE_SIZE = 9;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const data = await listArticles({
    page,
    pageSize: PAGE_SIZE,
    status: "published",
  }).catch(() => ({ items: [], total: 0, page, pageSize: PAGE_SIZE }));

  return (
    <MainGrid sidebar={<HomeSidebar />}>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">文章归档</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {data.total} 篇 · 第 {data.page} / {Math.max(1, Math.ceil(data.total / PAGE_SIZE))} 页
        </p>
      </header>
      {data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          还没有文章。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {data.items.map((a) => (
            <PostCard key={a.id} article={a} />
          ))}
        </div>
      )}
      <Pagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        basePath="/articles"
        className="mt-8"
      />
    </MainGrid>
  );
}