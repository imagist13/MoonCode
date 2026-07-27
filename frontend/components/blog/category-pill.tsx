import Link from "next/link";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";

/** 分类胶囊按钮。 */
export function CategoryPill({
  category,
  active,
}: {
  category: Category;
  active?: boolean;
}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border/70 text-muted-foreground hover:border-foreground hover:text-foreground"
      )}
    >
      {category.name}
      {typeof category.count === "number" && (
        <span className="opacity-60">{category.count}</span>
      )}
    </Link>
  );
}
