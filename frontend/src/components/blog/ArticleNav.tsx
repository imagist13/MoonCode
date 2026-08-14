"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ArticleNavItem {
  id: number;
  articleTitle: string;
  articleCover?: string;
}

interface Props {
  prev: ArticleNavItem | null;
  next: ArticleNavItem | null;
}

export function ArticleNav({ prev, next }: Props) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid gap-4 border-t border-border/60 pt-8 md:grid-cols-2">
      {prev ? (
        <Link href={`/articles/${prev.id}`} className="group block">
          <Card className="h-full p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ChevronLeft className="h-3.5 w-3.5" />
              上一篇
            </div>
            <div className="mt-2 line-clamp-2 text-sm font-medium
                            transition-colors group-hover:text-brand-600
                            dark:group-hover:text-brand-400">
              {prev.articleTitle}
            </div>
          </Card>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/articles/${next.id}`}
          className="group block md:text-right"
        >
          <Card className="h-full p-4">
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              下一篇
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
            <div className="mt-2 line-clamp-2 text-sm font-medium
                            transition-colors group-hover:text-brand-600
                            dark:group-hover:text-brand-400">
              {next.articleTitle}
            </div>
          </Card>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
