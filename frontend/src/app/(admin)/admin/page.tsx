"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Eye,
  FileText,
  FolderTree,
  List,
  Mail,
  MessageCircle,
  Plus,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ==============================
 * 数据类型（与 /admin 返回对齐）
 * ============================== */

interface CountItem {
  name: string;
  value: number;
}

interface DailyStat {
  date: string;
  count: number;
}

interface DashboardData {
  articleCount: number;
  userCount: number;
  messageCount: number;
  viewCount: number;
  categoryList?: CountItem[];
  articleStatisticsList?: DailyStat[];
  viewList?: DailyStat[];
}

interface ArticleRow {
  id: number;
  articleTitle: string;
  categoryName?: string;
  status: number;
  createTime: string;
}

interface PageData {
  records: ArticleRow[];
  count: number;
}

const STATUS_MAP: Record<number, { label: string; dot: string }> = {
  1: { label: "公开", dot: "bg-emerald-500" },
  2: { label: "私密", dot: "bg-muted-foreground/50" },
  3: { label: "草稿", dot: "bg-amber-500" },
};

const NUMBER = new Intl.NumberFormat("zh-CN");

function formatNumber(n: number) {
  return NUMBER.format(n);
}

function formatDay(iso: string) {
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})/);
  return m ? `${m[1]}/${m[2]}` : iso;
}

/* ==============================
 * 仪表盘
 * ============================== */

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState<ArticleRow[] | null>(null);
  const [latestLoading, setLatestLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    api
      .get<DashboardData>("/admin")
      .then((res) => {
        if (!cancelled && res.flag) setData(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    api
      .get<PageData>("/admin/articles?current=1&size=5")
      .then((res) => {
        if (!cancelled && res.flag) setLatest(res.data.records ?? []);
      })
      .catch(() => {
        if (!cancelled) setLatest([]);
      })
      .finally(() => {
        if (!cancelled) setLatestLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      label: "文章",
      hint: "全部内容",
      value: data?.articleCount ?? 0,
      icon: FileText,
    },
    {
      label: "用户",
      hint: "注册账号",
      value: data?.userCount ?? 0,
      icon: Users,
    },
    {
      label: "留言",
      hint: "留言板",
      value: data?.messageCount ?? 0,
      icon: Mail,
    },
    {
      label: "访问量",
      hint: "累计访问",
      value: data?.viewCount ?? 0,
      icon: Eye,
    },
  ];

  const viewSeries = useMemo(
    () =>
      (data?.viewList ?? []).map((d) => ({
        day: formatDay(d.date),
        date: d.date,
        count: d.count,
      })),
    [data?.viewList],
  );

  const viewTotal = useMemo(
    () => viewSeries.reduce((sum, d) => sum + d.count, 0),
    [viewSeries],
  );

  const categories = useMemo(() => {
    const list = [...(data?.categoryList ?? [])]
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    const max = Math.max(1, ...list.map((c) => c.value));
    return { list, max };
  }, [data?.categoryList]);

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-8">
      {/* 页头 */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            概览
          </p>
          <h1 className="mt-2 text-[28px] leading-none font-semibold tracking-[-0.03em] text-foreground">
            仪表盘
          </h1>
          <p className="mt-2.5 text-[12.5px] text-muted-foreground">
            站点内容、互动与访问数据一览。
          </p>
        </div>
        <Link
          href="/admin/articles/create"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-medium text-primary-foreground transition-opacity hover:opacity-85"
        >
          <Plus className="size-3.5" />
          发布文章
        </Link>
      </header>

      {/* KPI 条：一个面板，用发丝线分栏 */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {stat.label}
              </span>
              <stat.icon className="size-3.5 text-muted-foreground/70" />
            </div>
            <p className="mt-3 text-[30px] leading-none font-semibold tracking-[-0.03em] text-foreground">
              {loading ? (
                <span className="inline-block h-7 w-16 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              ) : (
                formatNumber(stat.value)
              )}
            </p>
            <p className="mt-2 text-[10.5px] text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </div>

      {/* 趋势 + 分类 */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="访问趋势"
          description="最近 7 天独立访客"
          action={
            <span className="text-[11px] text-muted-foreground">
              合计 {loading ? "—" : formatNumber(viewTotal)}
            </span>
          }
        >
          {viewSeries.length === 0 ? (
            <EmptyBlock title="暂无访问数据" hint="有访客后这里会出现趋势" />
          ) : !mounted ? (
            <div className="h-[210px] animate-pulse rounded-lg bg-muted/60 motion-reduce:animate-none" />
          ) : (
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewSeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="adminViewsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--admin-accent)" stopOpacity={0.14} />
                      <stop offset="100%" stopColor="var(--admin-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--admin-line)"
                    strokeWidth={1}
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                    tick={{ fontSize: 10, fill: "var(--admin-soft)" }}
                  />
                  <YAxis
                    width={40}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "var(--admin-soft)" }}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--admin-line)", strokeWidth: 1 }}
                    contentStyle={{
                      background: "var(--admin-surface)",
                      border: "1px solid var(--admin-line)",
                      borderRadius: 10,
                      padding: "6px 10px",
                      fontFamily: "inherit",
                    }}
                    labelStyle={{ color: "var(--admin-soft)", fontSize: 10.5 }}
                    itemStyle={{ color: "var(--admin-ink)", fontSize: 11.5 }}
                    formatter={(value) => [`${formatNumber(Number(value))} 次`, "访问"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--admin-accent)"
                    strokeWidth={2}
                    fill="url(#adminViewsFill)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      strokeWidth: 2,
                      stroke: "var(--admin-surface)",
                      fill: "var(--admin-accent)",
                    }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 可访问的表格视图 */}
          <table className="sr-only">
            <caption>最近 7 天独立访客</caption>
            <thead>
              <tr>
                <th scope="col">日期</th>
                <th scope="col">访问量</th>
              </tr>
            </thead>
            <tbody>
              {viewSeries.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="分类分布" description="各分类下的文章数">
          {categories.list.length === 0 ? (
            <EmptyBlock title="暂无分类数据" hint="创建分类并发布文章后会显示" />
          ) : (
            <div className="space-y-4">
              {categories.list.map((category) => (
                <div key={category.name} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[12px] text-foreground">
                      {category.name}
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {category.value}
                    </span>
                  </div>
                  <div className="h-[3px] overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground/75"
                      style={{
                        width: `${Math.max(3, (category.value / categories.max) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* 最新文章 + 快捷操作 */}
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="最新文章"
          description="最近创建或更新的内容"
          action={
            <Link
              href="/admin/articles"
              className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              查看全部
              <ArrowUpRight className="size-3" />
            </Link>
          }
        >
          {latestLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="size-1.5 rounded-full bg-muted" />
                  <span className="h-3 flex-1 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  <span className="h-3 w-20 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                </div>
              ))}
            </div>
          ) : !latest || latest.length === 0 ? (
            <EmptyBlock title="还没有文章" hint="发布第一篇内容后会显示在这里" />
          ) : (
            <div className="divide-y divide-border">
              {latest.map((article) => {
                const status = STATUS_MAP[article.status] ?? {
                  label: "未知",
                  dot: "bg-muted-foreground/50",
                };
                return (
                  <Link
                    key={article.id}
                    href={`/admin/articles/create?id=${article.id}`}
                    className="group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <span className={cn("size-1.5 shrink-0 rounded-full", status.dot)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-foreground transition-opacity group-hover:opacity-70">
                        {article.articleTitle}
                      </p>
                      <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                        {article.categoryName || "未分类"} · {status.label} ·{" "}
                        {article.createTime?.slice(0, 10)}
                      </p>
                    </div>
                    <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title="快捷操作" description="常用入口">
          <div className="divide-y divide-border">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <action.icon className="size-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] text-foreground transition-opacity group-hover:opacity-70">
                    {action.title}
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ArrowUpRight className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ==============================
 * 小组件
 * ============================== */

function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-medium text-foreground">{title}</h2>
          {description && (
            <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0 pt-0.5">{action}</div>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function EmptyBlock({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex h-[180px] flex-col items-center justify-center gap-1 text-center">
      <p className="text-[12.5px] text-foreground">{title}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

const quickActions: QuickAction[] = [
  { title: "发布文章", description: "写一篇新文章", icon: Plus, href: "/admin/articles/create" },
  { title: "文章列表", description: "管理现有文章", icon: List, href: "/admin/articles" },
  { title: "分类管理", description: "整理文章分类", icon: FolderTree, href: "/admin/categories" },
  { title: "标签管理", description: "维护内容标签", icon: Tags, href: "/admin/tags" },
  { title: "评论管理", description: "审核读者评论", icon: MessageCircle, href: "/admin/comments" },
  { title: "留言管理", description: "查看站点留言", icon: Mail, href: "/admin/messages" },
];
