import { Card, CardContent } from "@/components/ui/card";
import { readServerSession } from "@/lib/auth/session";
import { api } from "@/lib/api/client";
import type { Tag } from "@/types/tag";

export default async function AdminTagsPage() {
  const session = (await readServerSession())!;
  const tags = await api<Tag[]>("/tags", { token: session.token }).catch(() => []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">标签</h1>
        <p className="mt-1 text-sm text-muted-foreground">共 {tags.length} 个标签</p>
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
              {tags.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    还没有标签
                  </td>
                </tr>
              )}
              {tags.map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 font-medium">#{t.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{t.slug}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                    {t.articleCount ?? 0}
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