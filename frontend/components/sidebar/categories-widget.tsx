import Link from "next/link";
import { FolderTree } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface CategoryNavItem {
  slug: string;
  name: string;
  count?: number;
}

interface CategoriesWidgetProps {
  items: CategoryNavItem[];
  limit?: number;
}

export function CategoriesWidget({ items, limit = 8 }: CategoriesWidgetProps) {
  const list = items.slice(0, limit);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FolderTree className="h-4 w-4 text-primary" />
          分类
        </CardTitle>
        <Link
          href="/categories"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          全部 →
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无分类</p>
        ) : (
          <ul className="space-y-1.5">
            {list.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categories/${c.slug}` as never}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="truncate">{c.name}</span>
                  {typeof c.count === "number" && (
                    <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground tabular-nums">
                      {c.count}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
