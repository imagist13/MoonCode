"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Calendar, ChevronRight, Tag as TagIcon, FolderTree, Flame } from "lucide-react";
import { SidebarCard, FadeScrollContainer } from "./SidebarCard";
import { api } from "@/lib/api";
import { cn, formatViews } from "@/lib/utils";

/** 分类侧栏（spec §4.5.2） */
export function CategorySidebar({
  activeId,
  onSelect,
}: {
  activeId?: string | null;
  onSelect?: (id: number | null) => void;
}) {
  const [list, setList] = useState<{ id: number; categoryName: string; articleCount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ id: number; categoryName: string; articleCount: number }[]>("/categories")
      .then((res) => {
        if (res.flag && res.data) setList(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SidebarCard title="文章分类" icon={<FolderTree className="h-4 w-4" />}>
      {loading ? (
        <ul className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-8 rounded bg-gray-100 dark:bg-gray-700" />
          ))}
        </ul>
      ) : (
        <FadeScrollContainer maxHeight="15rem">
          <ul className="space-y-2">
            <li>
              <button
                type="button"
                onClick={() => onSelect?.(null)}
                className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span>全部分类</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </li>
            {list.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(cat.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm transition-colors",
                    String(activeId) === String(cat.id)
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700",
                  )}
                >
                  <span>{cat.categoryName}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {cat.articleCount}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </FadeScrollContainer>
      )}
    </SidebarCard>
  );
}

/** 标签侧栏（spec §4.5.3） */
export function TagSidebar({
  activeId,
  onSelect,
}: {
  activeId?: string | null;
  onSelect?: (id: number | null) => void;
}) {
  const [list, setList] = useState<{ id: number; tagName: string; articleCount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ id: number; tagName: string; articleCount: number }[]>("/tags")
      .then((res) => {
        if (res.flag && res.data) setList(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SidebarCard title="文章标签" icon={<TagIcon className="h-4 w-4" />}>
      {loading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-6 w-14 rounded-full bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-center text-xs text-gray-400">暂无标签</p>
      ) : (
        <FadeScrollContainer maxHeight="15rem">
          <div className="flex flex-wrap gap-2">
            {list.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect?.(String(activeId) === String(t.id) ? null : t.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm transition-colors",
                  String(activeId) === String(t.id)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
                )}
              >
                {t.tagName}
              </button>
            ))}
          </div>
        </FadeScrollContainer>
      )}
    </SidebarCard>
  );
}

/** 热门文章（spec §4.5.4） */
export function RecommendedArticles() {
  const [list, setList] = useState<
    { id: number; articleTitle: string; viewCount?: number; createTime: string; categoryName?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{
        records: { id: number; articleTitle: string; viewCount?: number; createTime: string; categoryName?: string }[];
      }>("/articles?current=1&size=8")
      .then((res) => {
        if (res.flag && res.data) setList(res.data.records);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SidebarCard title="热门文章" icon={<Flame className="h-4 w-4" />}>
      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-12 rounded bg-gray-100 dark:bg-gray-700" />
          ))}
        </ul>
      ) : list.length === 0 ? (
        <p className="text-center text-xs text-gray-400">暂无推荐</p>
      ) : (
        <FadeScrollContainer maxHeight="20rem">
          <ul className="space-y-1">
            {list.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/articles/${a.id}`}
                  className="group block rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <h4 className="line-clamp-2 break-words text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                    {a.articleTitle}
                  </h4>
                  <div className="mt-1.5 flex items-center gap-1 truncate text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span className="truncate">{a.createTime}</span>
                    <span className="shrink-0">•</span>
                    <span className="truncate">{a.categoryName || "未分类"}</span>
                    {a.viewCount !== undefined && (
                      <>
                        <span className="shrink-0">•</span>
                        <Eye className="h-3 w-3 shrink-0" />
                        <span>{formatViews(a.viewCount)}</span>
                      </>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </FadeScrollContainer>
      )}
    </SidebarCard>
  );
}