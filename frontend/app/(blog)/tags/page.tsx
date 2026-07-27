import type { Metadata } from "next";
import Link from "next/link";
import { tags } from "@/lib/api/tags";
import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/types/tag";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Tags",
  description: "所有标签。",
};

export default async function TagsPage() {
  let list: Tag[] = [];
  try {
    list = (await tags.list({ revalidate: 120 })) ?? [];
  } catch {
    list = [];
  }
  return (
    <>
      <header className="mb-12">
        <div className="label-mono text-muted-foreground">Index</div>
        <h1 className="mt-3 text-4xl tracking-tight md:text-5xl">
          <span className="display-serif">Tags</span>
        </h1>
      </header>
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无标签。</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {list.map((t) => (
            <Link key={t.id} href={`/tags/${t.slug}`}>
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest">
                {t.name}
                {typeof t.count === "number" && (
                  <span className="ml-1 opacity-60">{t.count}</span>
                )}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
