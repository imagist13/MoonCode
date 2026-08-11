import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MainGrid } from "@/components/layout/main-grid";
import { ProfileWidget } from "@/components/sidebar/profile-widget";
import { AnnouncementWidget } from "@/components/sidebar/announcement-widget";
import { MarkdownRenderer } from "@/components/post/markdown-renderer";
import { PostMeta } from "@/components/post/post-meta";
import { ReadingProgress } from "@/components/post/reading-progress";
import { TableOfContents } from "@/components/post/table-of-contents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getArticleBySlug } from "@/lib/api/articles";
import { formatDate } from "@/lib/utils";
import type { TocItem } from "@/components/post/table-of-contents";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const items: TocItem[] = [];
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^(#{2,3})\s+(.+)/.exec(line);
    if (!m) continue;
    const depth = m[1].length;
    const text = m[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-");
    items.push({ id, text, depth });
  }
  return items;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let article;
  try {
    article = await getArticleBySlug(slug);
  } catch {
    return notFound();
  }

  const toc = extractToc(article.content);

  return (
    <article>
      <ReadingProgress />
      <MainGrid
        sidebar={
          <div className="space-y-6">
            <ProfileWidget />
            <AnnouncementWidget />
            <div className="rounded-xl border border-border bg-card p-5">
              <TableOfContents items={toc} />
            </div>
          </div>
        }
      >
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
          <Link href="/articles">
            <ArrowLeft className="h-4 w-4" /> 返回列表
          </Link>
        </Button>

        <header className="mb-6">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            发布于 {formatDate(article.publishedAt ?? article.createdAt)}
          </p>
          {article.tags && article.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {article.tags.map((t) => (
                <Link key={t.slug} href={`/tags/${t.slug}` as never}>
                  <Badge variant="muted" className="hover:bg-primary/10 hover:text-primary">
                    #{t.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </header>

        <MarkdownRenderer content={article.content} />

        {article.category && (
          <div className="mt-10 rounded-xl border border-border bg-muted/30 p-5 text-sm">
            <span className="text-muted-foreground">分类：</span>
            <Link
              href={`/categories/${article.category.slug}` as never}
              className="font-medium text-primary hover:underline"
            >
              {article.category.name}
            </Link>
          </div>
        )}

        <PostMeta article={article} />
      </MainGrid>
    </article>
  );
}