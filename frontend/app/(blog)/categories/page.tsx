import Link from "next/link";
import { MainGrid } from "@/components/layout/main-grid";
import { HomeSidebar } from "@/components/sidebar/home-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCategories } from "@/lib/api/categories";

export default async function CategoriesPage() {
  const cats = await listCategories().catch(() => []);
  return (
    <MainGrid sidebar={<HomeSidebar />}>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">所有分类</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          按主题浏览，共 {cats.length} 个分类
        </p>
      </header>
      {cats.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          还没有分类。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}` as never}
              className="block"
            >
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{c.name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                      {c.articleCount ?? 0}
                    </span>
                  </CardTitle>
                </CardHeader>
                {c.description && (
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </MainGrid>
  );
}