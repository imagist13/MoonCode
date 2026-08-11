import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CategoryBarItem {
  slug: string;
  name: string;
  count?: number;
}

interface CategoryBarProps {
  items: CategoryBarItem[];
  activeSlug?: string;
  className?: string;
}

export function CategoryBar({ items, activeSlug, className }: CategoryBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/60 p-2 backdrop-blur",
        className
      )}
    >
      <Link
        href={"/articles"}
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          !activeSlug
            ? "bg-primary text-primary-foreground"
            : "text-foreground/70 hover:bg-muted hover:text-foreground"
        )}
      >
        全部
      </Link>
      {items.map((c) => {
        const active = activeSlug === c.slug;
        return (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}` as never}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{c.name}</span>
            {typeof c.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] tabular-nums",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {c.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
