import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { MainGrid } from "@/components/layout/main-grid";
import { HomeSidebar } from "@/components/sidebar/home-sidebar";
import { listArticles } from "@/lib/api/articles";

interface ArchiveEntry {
  year: number;
  items: Awaited<ReturnType<typeof listArticles>>["items"];
}

export default async function ArchivePage() {
  const data = await listArticles({
    page: 1,
    pageSize: 200,
    status: "published",
  }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 200 }));

  const groups: ArchiveEntry[] = [];
  for (const item of data.items) {
    const d = new Date(item.publishedAt ?? item.createdAt);
    const y = d.getFullYear();
    let g = groups.find((x) => x.year === y);
    if (!g) {
      g = { year: y, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }

  return (
    <MainGrid sidebar={<HomeSidebar />}>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">归档</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          按年汇总，共 {data.items.length} 篇
        </p>
      </header>
      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          还没有文章。
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.year}>
              <div className="mb-3 flex items-baseline justify-between border-b border-border pb-2">
                <h2 className="text-xl font-semibold tracking-tight">
                  {g.year}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {g.items.length} 篇
                </span>
              </div>
              <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                {g.items.map((a) => {
                  const d = new Date(a.publishedAt ?? a.createdAt);
                  const mmdd = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  return (
                    <li key={a.id}>
                      <Link
                        href={`/articles/${a.slug}` as never}
                        className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/60"
                      >
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground tabular-nums">
                          <Calendar className="h-3.5 w-3.5" />
                          {mmdd}
                        </span>
                        <span className="flex-1 truncate text-sm font-medium text-foreground/90 transition-colors group-hover:text-primary">
                          {a.title}
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </MainGrid>
  );
}