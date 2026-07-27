import type { Metadata } from "next";
import { articles } from "@/lib/api/articles";
import { ArticleCard } from "@/components/blog/article-card";
import { Pagination } from "@/components/blog/pagination";
import type { Article } from "@/types/article";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Articles",
  description: "所有已发布的文章。",
};

/** 文章列表页 —— Server Component，直接 await 数据。 */
export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = 10;

  let list: Article[] = [];
  let total = 0;
  try {
    const data = await articles.list(
      { page, pageSize, status: 1 },
      { revalidate: 60 }
    );
    list = data.list ?? [];
    total = data.total ?? 0;
  } catch {
    // 后端不可用时展示空态
  }

  return (
    <>
      <header className="mb-12">
        <div className="label-mono text-muted-foreground">Journal</div>
        <h1 className="mt-3 text-4xl tracking-tight md:text-5xl">
          <span className="display-serif">All</span> articles
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          按时间倒序排列的写作记录。
        </p>
      </header>

      {list.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          还没有已发布的文章。稍后再来看看，或者到后台写一篇。
        </p>
      ) : (
        <div>
          {list.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            basePath="/articles"
          />
        </div>
      )}
    </>
  );
}
