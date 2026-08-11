import Link from "next/link";
import { Tag } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface TagNavItem {
  slug: string;
  name: string;
  count?: number;
}

interface TagsWidgetProps {
  items: TagNavItem[];
  limit?: number;
}

export function TagsWidget({ items, limit = 20 }: TagsWidgetProps) {
  const list = items.slice(0, limit);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="h-4 w-4 text-accent" />
          标签
        </CardTitle>
        <Link
          href="/tags"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          全部 →
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无标签</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {list.map((t) => (
              <Link
                key={t.slug}
                href={`/tags/${t.slug}` as never}
                className="inline-flex"
              >
                <Badge variant="muted" className="hover:bg-primary/10 hover:text-primary">
                  <span>{t.name}</span>
                  {typeof t.count === "number" && (
                    <span className="ml-1 opacity-60">{t.count}</span>
                  )}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
