"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CaretRight,
  Tag as TagIcon,
  FolderSimple,
  Flame,
} from "@phosphor-icons/react";
import { SidebarCard, FadeScrollContainer } from "./SidebarCard";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

/** 分类侧栏 */
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
    <SidebarCard title="文章分类" icon={<FolderSimple />}>
      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-5 rounded bg-blog-muted" />
          ))}
        </ul>
      ) : (
        <FadeScrollContainer maxHeight="15rem">
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => onSelect?.(null)}
                className="flex w-full items-center justify-between py-1.5 text-left text-[13.5px] text-blog-soft transition-colors hover:text-blog-ink"
              >
                <span>全部分类</span>
                <CaretRight className="h-3 w-3 opacity-40" />
              </button>
            </li>
            {list.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(cat.id)}
                  className={cn(
                    "flex w-full items-center justify-between py-1.5 text-left text-[13.5px] transition-colors",
                    String(activeId) === String(cat.id)
                      ? "font-medium text-blog-ink"
                      : "text-blog-soft hover:text-blog-ink",
                  )}
                >
                  <span className="truncate">{cat.categoryName}</span>
                  <span className="ml-3 shrink-0 font-mono text-[10.5px] text-blog-soft/70">
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

/** 标签侧栏 */
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
    <SidebarCard title="文章标签" icon={<TagIcon />}>
      {loading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-6 w-14 rounded-full bg-blog-muted" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-[12px] text-blog-soft/70">暂无标签</p>
      ) : (
        <FadeScrollContainer maxHeight="15rem">
          <div className="flex flex-wrap gap-2">
            {list.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect?.(String(activeId) === String(t.id) ? null : t.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[12px] transition-colors",
                  String(activeId) === String(t.id)
                    ? "border-blog-ink bg-blog-ink text-blog-bg"
                    : "border-blog-line text-blog-soft hover:border-blog-soft hover:text-blog-ink",
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

/** 热门文章 */
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
    <SidebarCard title="热门文章" icon={<Flame />}>
      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-10 rounded bg-blog-muted" />
          ))}
        </ul>
      ) : list.length === 0 ? (
        <p className="text-[12px] text-blog-soft/70">暂无推荐</p>
      ) : (
        <FadeScrollContainer maxHeight="20rem">
          <ul>
            {list.map((a) => (
              <li key={a.id} className="border-t border-blog-line first:border-t-0">
                <Link href={`/articles/${a.id}`} className="group block py-3">
                  <h4 className="line-clamp-2 text-[13px] leading-snug font-medium text-blog-ink transition-opacity group-hover:opacity-60">
                    {a.articleTitle}
                  </h4>
                  <div className="mt-1.5 flex items-center gap-1.5 truncate text-[10.5px] text-blog-soft">
                    <span className="truncate">{a.createTime}</span>
                    <span className="shrink-0">·</span>
                    <span className="truncate">{a.categoryName || "未分类"}</span>
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
