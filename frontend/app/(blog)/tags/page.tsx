import Link from "next/link";
import { MainGrid } from "@/components/layout/main-grid";
import { HomeSidebar } from "@/components/sidebar/home-sidebar";
import { Badge } from "@/components/ui/badge";
import { listTags } from "@/lib/api/tags";

export default async function TagsPage() {
  const tags = await listTags().catch(() => []);
  return (
    <MainGrid sidebar={<HomeSidebar />}>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">所有标签</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {tags.length} 个标签
        </p>
      </header>
      {tags.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          还没有标签。
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t.slug}
              href={`/tags/${t.slug}` as never}
              className="inline-flex"
            >
              <Badge variant="outline" className="px-3 py-1.5 text-sm hover:bg-primary/10 hover:text-primary">
                #{t.name}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {t.articleCount ?? 0}
                </span>
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </MainGrid>
  );
}