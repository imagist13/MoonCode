"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

interface ArchiveArticle {
  id: number;
  articleTitle: string;
  createTime: string;
}

interface PageResult {
  records: ArchiveArticle[];
  count: number;
}

interface MonthGroup {
  month: string;
  items: ArchiveArticle[];
}

interface YearGroup {
  year: string;
  count: number;
  months: MonthGroup[];
}

/** 按年 → 月分组归档文章，年、月均倒序 */
function groupByYearMonth(articles: ArchiveArticle[]): YearGroup[] {
  const years = new Map<string, Map<string, ArchiveArticle[]>>();

  for (const article of articles) {
    const date = new Date(article.createTime);
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");

    if (!years.has(year)) years.set(year, new Map());
    const months = years.get(year)!;
    if (!months.has(month)) months.set(month, []);
    months.get(month)!.push(article);
  }

  return [...years.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, months]) => ({
      year,
      count: [...months.values()].reduce((sum, items) => sum + items.length, 0),
      months: [...months.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, items]) => ({ month, items })),
    }));
}

/**
 * 归档页：年份可折叠，月份沿虚线时间轴排布。
 * 最新年份默认展开，其余年份收起；圆点标记每个月份，行 hover 时标题轻微右移。
 */
export default function ArchivesPage() {
  const [articles, setArticles] = useState<ArchiveArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggledYears, setToggledYears] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api
      .get<PageResult>("/articles/archives?current=1&size=50")
      .then((res) => {
        if (res.flag && res.data) {
          setArticles(res.data.records || []);
          setTotal(res.data.count ?? res.data.records?.length ?? 0);
        }
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-blog-ink">
          归档
        </h1>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[13px] text-blog-soft">
        <p>加载失败: {error}</p>
      </div>
    );
  }

  const grouped = groupByYearMonth(articles);

  return (
    <div>
      <PageHeader
        title="归档"
        description={`共 ${total} 篇文章 · 按时间倒序`}
      />

      <div className="space-y-12">
        {grouped.map((group, yearIndex) => {
          // 最新年份默认展开，其余年份默认收起；点击后以用户选择为准
          const collapsed = toggledYears[group.year] ?? yearIndex > 0;

          return (
            <section key={group.year}>
              <button
                type="button"
                onClick={() =>
                  setToggledYears((prev) => ({
                    ...prev,
                    [group.year]: !collapsed,
                  }))
                }
                aria-expanded={!collapsed}
                className="group/year mb-5 flex items-baseline gap-2.5 text-left"
              >
                <span className="text-[22px] font-semibold tracking-[-0.03em] text-blog-ink">
                  {group.year}
                </span>
                <span className="font-mono text-[11px] text-blog-soft">
                  {group.count} 篇
                </span>
                <CaretRight
                  aria-hidden="true"
                  className={`h-3 w-3 text-blog-soft transition-transform duration-200 group-hover/year:text-blog-ink ${
                    collapsed ? "" : "rotate-90"
                  }`}
                />
              </button>

              {!collapsed && (
                <div>
                  {group.months.map(({ month, items }) => (
                    <div
                      key={month}
                      className="grid grid-cols-[36px_minmax(0,1fr)] sm:grid-cols-[56px_minmax(0,1fr)]"
                    >
                      {/* 时间轴：贯穿整月的虚线与月份圆点 */}
                      <div aria-hidden="true" className="relative">
                        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-blog-line" />
                        <span className="absolute top-[7px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-blog-ink ring-4 ring-blog-bg" />
                      </div>

                      <div className="pb-8 last:pb-0">
                        <h3 className="mb-1 flex items-baseline gap-2 text-[14px] font-semibold text-blog-ink">
                          {parseInt(month, 10)} 月
                          <span className="font-mono text-[11px] font-normal text-blog-soft">
                            ({items.length})
                          </span>
                        </h3>

                        <ul className="divide-y divide-blog-line border-t border-blog-line">
                          {items.map((article) => {
                            const date = new Date(article.createTime);
                            const day = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                            return (
                              <li key={article.id}>
                                <Link
                                  href={`/articles/${article.id}`}
                                  className="group flex items-baseline gap-4 px-2 py-2.5 transition-colors hover:bg-blog-muted"
                                >
                                  <time className="shrink-0 font-mono text-[12px] tabular-nums text-blog-soft transition-colors group-hover:text-blog-ink">
                                    {day}
                                  </time>
                                  <span className="text-[13.5px] text-blog-soft transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blog-ink">
                                    {article.articleTitle}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {grouped.length === 0 && (
          <p className="py-10 text-center text-[13px] text-blog-soft">
            暂无归档文章
          </p>
        )}
      </div>
    </div>
  );
}
