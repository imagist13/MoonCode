import { FileText, Folder, Tag as TagIcon, Users } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { articles } from "@/lib/api/articles";
import { categories } from "@/lib/api/categories";
import { tags } from "@/lib/api/tags";
import { getSession } from "@/lib/auth/session";
import type { Article } from "@/types/article";
import { format } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

/** 后台仪表盘 —— 统计 + 最近文章表格。 */
export default async function AdminDashboardPage() {
  const session = await getSession();

  const [articleData, categoryData, tagData] = await Promise.all([
    articles.list({ page: 1, pageSize: 5 }).catch(() => ({ list: [], total: 0 })),
    categories.list().catch(() => []),
    tags.list().catch(() => []),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <div className="label-mono text-muted-foreground">Dashboard</div>
        <h1 className="mt-2 text-3xl tracking-tight">
          <span className="display-serif">Welcome</span>
          {session?.user?.nickname
            ? `, ${session.user.nickname}`
            : session?.user?.username
            ? `, ${session.user.username}`
            : ""}
          。
        </h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Articles"
          value={articleData.total ?? 0}
          icon={FileText}
        />
        <StatCard
          label="Categories"
          value={categoryData.length}
          icon={Folder}
        />
        <StatCard label="Tags" value={tagData.length} icon={TagIcon} />
        <StatCard label="Users" value={session ? 1 : 0} icon={Users} />
      </section>

      <section>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">最近文章</CardTitle>
            <Link
              href="/admin/articles/new"
              className="label-mono text-muted-foreground hover:text-foreground"
            >
              新建 →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <RecentArticleTable list={articleData.list ?? []} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function RecentArticleTable({ list }: { list: Article[] }) {
  if (list.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        暂无文章。到「写文章」新建一篇。
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b text-left text-xs uppercase tracking-widest text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-mono">标题</th>
            <th className="px-6 py-3 font-mono">状态</th>
            <th className="px-6 py-3 font-mono">更新</th>
          </tr>
        </thead>
        <tbody>
          {list.map((a) => (
            <tr key={a.id} className="border-b last:border-b-0">
              <td className="px-6 py-3">{a.title}</td>
              <td className="px-6 py-3 text-muted-foreground">
                {a.status === 1 ? "已发布" : a.status === 2 ? "归档" : "草稿"}
              </td>
              <td className="px-6 py-3 text-muted-foreground">
                {a.updated_at
                  ? format(new Date(a.updated_at), "yyyy-MM-dd HH:mm")
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
