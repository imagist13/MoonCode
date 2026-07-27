import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles } from "@/lib/api/articles";
import { ArticleMeta } from "@/components/blog/article-meta";
import { TagList } from "@/components/blog/tag-list";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { BackToTop } from "@/components/common/back-to-top";

export const revalidate = 60;
export const dynamicParams = true;

/** 若后端支持批量返回 slug，可在这里预生成。默认空数组，按需 ISR。 */
export async function generateStaticParams() {
  return [] as { slug: string }[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const a = await articles.bySlug(slug, { revalidate: 60 });
    return {
      title: a.title,
      description: a.summary,
      openGraph: {
        title: a.title,
        description: a.summary,
        images: a.cover ? [a.cover] : undefined,
      },
    };
  } catch {
    return { title: slug };
  }
}

/** 文章详情。 */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let article;
  try {
    article = await articles.bySlug(slug, { revalidate: 60 });
  } catch {
    notFound();
  }

  return (
    <>
      <ReadingProgress />
      <article className="grid gap-12 lg:grid-cols-[1fr_220px]">
        <div>
          <header className="mb-10">
            <ArticleMeta article={article} />
            <h1 className="mt-6 text-4xl leading-tight tracking-tight md:text-5xl">
              {article.title}
            </h1>
            {article.summary && (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {article.summary}
              </p>
            )}
          </header>

          <MarkdownRenderer content={article.content ?? ""} />

          {article.tags && article.tags.length > 0 && (
            <div className="mt-16 border-t border-border/60 pt-8">
              <div className="label-mono mb-3 text-muted-foreground">Tagged</div>
              <TagList tags={article.tags} />
            </div>
          )}
        </div>

        {/* TOC 占位（下一阶段接入 use-toc） */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="label-mono text-muted-foreground">Contents</div>
            <p className="mt-3 text-xs text-muted-foreground">
              目录将根据文章标题自动生成。
            </p>
          </div>
        </aside>
      </article>
      <BackToTop />
    </>
  );
}
