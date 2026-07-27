import { format } from "date-fns";
import type { Article } from "@/types/article";
import { siteConfig } from "@/config/site";

/**
 * 文章元信息条：Moon · 日期 · 阅读时长 · 分类。
 * 使用 font-mono 呈现细节。
 */
export function ArticleMeta({ article }: { article: Article }) {
  const date =
    article.published_at ?? article.updated_at ?? article.created_at;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
      <span>{siteConfig.name}</span>
      <span aria-hidden>·</span>
      {date && <span>{format(new Date(date), "yyyy MMM dd")}</span>}
      {article.reading_time ? (
        <>
          <span aria-hidden>·</span>
          <span>{article.reading_time} min read</span>
        </>
      ) : null}
      {article.category?.name && (
        <>
          <span aria-hidden>·</span>
          <span>#{article.category.name}</span>
        </>
      )}
    </div>
  );
}
