import Link from "next/link";
import type { Tag } from "@/types/tag";
import { Badge } from "@/components/ui/badge";

/** 标签列表（可点击跳转）。 */
export function TagList({ tags }: { tags: Tag[] }) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <Link key={t.id} href={`/tags/${t.slug}`}>
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest">
            {t.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
