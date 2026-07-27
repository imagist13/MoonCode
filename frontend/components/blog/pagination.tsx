import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
}

/** 极简分页（Prev / Page / Next）。 */
export function Pagination({ page, pageSize, total, basePath }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const linkFor = (p: number) => `${basePath}?page=${p}`;

  return (
    <nav className="mt-10 flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em]">
      <Link
        href={linkFor(Math.max(1, page - 1))}
        aria-disabled={!hasPrev}
        className={cn(
          "rounded-full border border-border/60 px-4 py-1 transition-colors",
          hasPrev
            ? "hover:border-foreground hover:text-foreground"
            : "pointer-events-none opacity-40"
        )}
      >
        ← Prev
      </Link>
      <span className="text-muted-foreground">
        {page} / {totalPages}
      </span>
      <Link
        href={linkFor(Math.min(totalPages, page + 1))}
        aria-disabled={!hasNext}
        className={cn(
          "rounded-full border border-border/60 px-4 py-1 transition-colors",
          hasNext
            ? "hover:border-foreground hover:text-foreground"
            : "pointer-events-none opacity-40"
        )}
      >
        Next →
      </Link>
    </nav>
  );
}
