import Link from "next/link";
import { format } from "date-fns";
import type { Article } from "@/types/article";
import { cn } from "@/lib/utils";

/** 文章列表卡片（极简 hairline 风格）。 */
export function ArticleCard({
  article,
  className,
}: {
  article: Article;
  className?: string;
}) {
  const date =
    article.published_at ?? article.updated_at ?? article.created_at;
  return (
    <article
      className={cn(
        "group grid gap-2 border-b border-border/60 py-8 md:grid-cols-[160px_1fr] md:gap-8",
        className
      )}
    >
      <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {date ? format(new Date(date), "yyyy · MM · dd") : "unpublished"}
        {article.reading_time ? (
          <span className="ml-2">· {article.reading_time} min</span>
        ) : null}
      </div>
      <div>
        <h3 className="text-xl font-medium tracking-tight text-foreground">
          <Link
            href={`/articles/${article.slug}`}
            className="transition-colors hover:text-primary"
          >
            {article.title}
          </Link>
        </h3>
        {article.summary && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        )}
        {article.category?.name && (
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            #{article.category.name}
          </div>
        )}
      </div>
    </article>
  );
}
