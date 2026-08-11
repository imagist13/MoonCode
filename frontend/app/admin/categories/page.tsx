import { Card, CardContent } from "@/components/ui/card";
import { readServerSession } from "@/lib/auth/session";
import { api } from "@/lib/api/client";
import type { Category } from "@/types/category";

export default async function AdminCategoriesPage() {
  const session = (await readServerSession())!;
  const cats = await api<Category[]>("/categories", { token: session.token })
    .catch(() => []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">分类</h1>
        <p className="mt-1 text-sm text-muted-foreground">共 {cats.length} 个分类</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">名称</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium text-right">文章数</th>
              </tr>
            </thead>
            <tbody>
              {cats.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    还没有分类
                  </td>
                </tr>
              )}
              {cats.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.slug}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                    {c.articleCount ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}