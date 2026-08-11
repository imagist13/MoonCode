import Link from "next/link";
import { notFound } from "next/navigation";
import { MainGrid } from "@/components/layout/main-grid";
import { HomeSidebar } from "@/components/sidebar/home-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Pagination } from "@/components/post/pagination";
import { getCategoryBySlug } from "@/lib/api/categories";
import { listArticles } from "@/lib/api/articles";

const PAGE_SIZE = 9;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));

  let category;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    return notFound();
  }
  const data = await listArticles({
    page,
    pageSize: PAGE_SIZE,
    category: slug,
    status: "published",
  }).catch(() => ({ items: [], total: 0, page, pageSize: PAGE_SIZE }));

  return (
    <MainGrid sidebar={<HomeSidebar />}>
      <header className="mb-6 rounded-xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          分类
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {category.description}
          </p>
        )}
        <Link
          href="/articles"
          className="mt-3 inline-block text-xs text-primary hover:underline"
        >
          查看全部文章
        </Link>
      </header>

      {data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          该分类下还没有文章。
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
        basePath={`/categories/${slug}`}
        className="mt-8"
      />
    </MainGrid>
  );
}