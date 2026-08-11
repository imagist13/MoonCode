import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { PostMeta } from "./post-meta";
import { Card } from "@/components/ui/card";
import type { ArticleSummary } from "@/types/article";

export function PostCard({ article }: { article: ArticleSummary }) {
  return (
    <Card className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
      <article className="flex h-full flex-col">
        {article.cover && (
          <Link
            href={`/articles/${article.slug}` as never}
            className="relative block aspect-[16/9] overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        )}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <Link href={`/articles/${article.slug}` as never}>
            <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
              {article.title}
            </h2>
          </Link>
          {article.excerpt && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {article.excerpt}
            </p>
          )}
          <div className="mt-auto flex flex-col gap-3">
            <PostMeta article={article} />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {article.viewCount ?? 0}
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {article.likeCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Card>
  );
}