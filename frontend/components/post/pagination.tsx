"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  basePath: string; // e.g. "/articles"
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const hrefFor = (p: number) =>
    (p === 1 ? basePath : `${basePath}?page=${p}`) as never;

  const items: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      items.push(i);
    } else if (
      (i === page - 2 && page > 3) ||
      (i === page + 2 && page < totalPages - 2)
    ) {
      items.push("...");
    }
  }

  return (
    <nav
      aria-label="分页"
      className={cn("flex items-center justify-center gap-1.5 pt-4", className)}
    >
      {prev !== null ? (
        <Link
          href={hrefFor(prev)}
          aria-label="上一页"
          className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
          上一页
        </Link>
      ) : (
        <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-md border border-border/60 px-3 text-sm text-muted-foreground/60">
          <ChevronLeft className="h-4 w-4" />
          上一页
        </span>
      )}
      <ul className="flex items-center gap-1">
        {items.map((it, idx) =>
          it === "..." ? (
            <li
              key={`dot-${idx}`}
              className="px-1 text-sm text-muted-foreground"
            >
              …
            </li>
          ) : (
            <li key={it}>
              <Link
                href={hrefFor(it)}
                aria-current={it === page ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm tabular-nums",
                  it === page
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border hover:bg-muted"
                )}
              >
                {it}
              </Link>
            </li>
          )
        )}
      </ul>
      {next !== null ? (
        <Link
          href={hrefFor(next)}
          aria-label="下一页"
          className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm hover:bg-muted"
        >
          下一页
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-md border border-border/60 px-3 text-sm text-muted-foreground/60">
          下一页
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}