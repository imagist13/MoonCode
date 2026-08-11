import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { readServerSession } from "@/lib/auth/session";
import { api } from "@/lib/api/client";
import type { ArticleListResponse } from "@/types/article";
import { formatDate } from "@/lib/utils";

export default async function AdminArticlesPage() {
  const session = (await readServerSession())!;
  const data = await api<ArticleListResponse>("/articles/me", {
    query: { pageSize: 50 },
    token: session.token,
  }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 50 }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">文章</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理你的全部文章 · 共 {data.total} 篇
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4" /> 写文章
          </Link>
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">标题</th>
                <th className="px-5 py-3 font-medium">状态</th>
                <th className="px-5 py-3 font-medium">分类</th>
                <th className="px-5 py-3 font-medium">发布时间</th>
                <th className="px-5 py-3 font-medium text-right">浏览</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    还没有文章，
                    <Link href="/admin/articles/new" className="text-primary hover:underline">
                      立即创作
                    </Link>
                    。
                  </td>
                </tr>
              )}
              {data.items.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                >
                  <td className="max-w-md truncate px-5 py-3 font-medium">
                    <Link
                      href={`/articles/${a.slug}` as never}
                      className="hover:text-primary"
                    >
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        a.status === "published"
                          ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-500"
                          : "rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-500"
                      }
                    >
                      {a.status === "published" ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {a.category?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {a.publishedAt ? formatDate(a.publishedAt) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                    {a.viewCount ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}