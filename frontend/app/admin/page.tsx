import { FileText, FolderTree, Tag as TagIcon, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readServerSession } from "@/lib/auth/session";
import { api } from "@/lib/api/client";
import type { ArticleListResponse } from "@/types/article";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";

async function fetchStats(token: string) {
  const [articles, cats, tags] = await Promise.allSettled([
    api<ArticleListResponse>("/articles", { query: { pageSize: 1 }, token }),
    api<Category[]>("/categories", { token }),
    api<Tag[]>("/tags", { token }),
  ]);
  return {
    totalArticles:
      articles.status === "fulfilled" ? articles.value.total : 0,
    totalCategories:
      cats.status === "fulfilled" ? cats.value.length : 0,
    totalTags: tags.status === "fulfilled" ? tags.value.length : 0,
    totalViews:
      articles.status === "fulfilled"
        ? articles.value.items.reduce((acc, a) => acc + (a.viewCount ?? 0), 0)
        : 0,
  };
}

export default async function AdminDashboard() {
  const session = (await readServerSession())!;
  const stats = await fetchStats(session.token);

  const items = [
    {
      label: "文章",
      value: stats.totalArticles,
      icon: FileText,
      tint: "bg-primary/10 text-primary",
    },
    {
      label: "分类",
      value: stats.totalCategories,
      icon: FolderTree,
      tint: "bg-accent/15 text-accent",
    },
    {
      label: "标签",
      value: stats.totalTags,
      icon: TagIcon,
      tint: "bg-emerald-500/15 text-emerald-500",
    },
    {
      label: "总阅读",
      value: stats.totalViews,
      icon: Eye,
      tint: "bg-amber-500/15 text-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          概览你的写作数据。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.tint}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">快速开始</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <p>· 在「写文章」里发布第一篇内容。</p>
          <p>· 在「分类」和「标签」里整理你的主题。</p>
          <p>· 在「账号」里更新你的资料与签名。</p>
        </CardContent>
      </Card>
    </div>
  );
}