import { Clock, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate, readingTime } from "@/lib/utils";
import type { ArticleSummary } from "@/types/article";

export function PostMeta({
  article,
  showCover = false,
}: {
  article: ArticleSummary;
  showCover?: boolean;
}) {
  const minutes = article.readingTime ?? readingTime(article.excerpt ?? "");
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {article.author && (
        <Link
          href={`/about` as never}
          className="inline-flex items-center gap-1.5 hover:text-foreground"
        >
          <Avatar className="h-5 w-5">
            <AvatarImage src={article.author.avatar ?? undefined} />
            <AvatarFallback>
              {article.author.nickname?.[0] ?? article.author.username[0]}
            </AvatarFallback>
          </Avatar>
          <span>{article.author.nickname ?? article.author.username}</span>
        </Link>
      )}
      <span className="inline-flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {formatDate(article.publishedAt ?? article.createdAt)}
      </span>
      {minutes > 0 && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {minutes} 分钟
        </span>
      )}
      {article.category && (
        <Link href={`/categories/${article.category.slug}` as never}>
          <Badge variant="muted" className="hover:bg-primary/10 hover:text-primary">
            {article.category.name}
          </Badge>
        </Link>
      )}
      {showCover === false && article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((t) => (
            <Link key={t.slug} href={`/tags/${t.slug}` as never}>
              <Badge variant="outline" className="hover:bg-muted">
                #{t.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}