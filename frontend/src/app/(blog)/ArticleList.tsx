"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArticleCard, ArticleListPagination, ArticleEmpty, ArticleError, type ArticleCardData } from "@/components/blog/ArticleCard";
import { AiImageGeneration } from "@/components/leibox/ai-generating/AiImageGeneration";
import { CategorySidebar, TagSidebar, RecommendedArticles } from "@/components/blog/Sidebars";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PageData {
  records: {
    id: number;
    articleTitle: string;
    articleCover?: string;
    articleContent?: string;
    isTop?: boolean;
    createTime?: string;
    categoryName?: string;
    viewCount?: number;
    tagVOList?: { id: number; tagName: string }[];
  }[];
  count: number;
}

const PAGE_SIZE = 10;

export default function ArticleList() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const categoryId = params.get("category");
  const tagId = params.get("tag");
  const hasFilter = !!(categoryId || tagId);

  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImages, setShowImages] = useState(true);
  const requestIdRef = useRef(0);
  const holdHeightRef = useRef<number | null>(null);

  // 图片开关持久化（对齐 dim_stack：记住用户偏好，刷新后仍生效）
  useEffect(() => {
    try {
      const saved = localStorage.getItem("showImages");
      if (saved !== null) setShowImages(JSON.parse(saved) === true);
    } catch {
      /* 隐私模式等场景下忽略 */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("showImages", JSON.stringify(showImages));
    } catch {
      /* 忽略写入失败 */
    }
  }, [showImages]);

  useEffect(() => {
    setCurrent(1);
    // 记录旧高度，避免布局抖动
    holdHeightRef.current = document.getElementById("article-list-wrap")?.offsetHeight ?? null;
    fetch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, tagId]);

  function fetch(page: number) {
    const thisReq = ++requestIdRef.current;
    setLoading(true);
    setError("");

    const qs = new URLSearchParams({
      current: String(page),
      size: String(PAGE_SIZE),
    });
    if (categoryId) qs.set("categoryId", categoryId);
    if (tagId) qs.set("tagId", tagId);

    const endpoint = hasFilter
      ? `/articles/condition?${qs.toString()}`
      : `/articles?${qs.toString()}`;

    api
      .get<PageData>(endpoint)
      .then((res) => {
        if (thisReq !== requestIdRef.current) return;
        if (res.flag && res.data) {
          const list = (res.data.records || []).map((a) => ({
            id: a.id,
            title: a.articleTitle,
            cover: a.articleCover,
            content: a.articleContent,
            isTop: a.isTop,
            categoryName: a.categoryName,
            publishTime: a.createTime,
            viewCount: a.viewCount,
            tags: a.tagVOList?.map((t) => ({ id: t.id, name: t.tagName })),
          }));
          setArticles(list);
          setTotal(res.data.count ?? 0);
        }
      })
      .catch((err: unknown) => {
        if (thisReq !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : "加载失败");
      })
      .finally(() => {
        if (thisReq === requestIdRef.current) {
          setLoading(false);
          holdHeightRef.current = null;
        }
      });
  }

  function setFilter(key: "category" | "tag", id: number | null) {
    const next = new URLSearchParams(params.toString());
    if (id === null) next.delete(key);
    else next.set(key, String(id));
    router.replace(`${pathname}?${next.toString()}`);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div id="articles" className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
      {/* 主列表 */}
      <main className="min-w-0">
        {/* 工具栏 */}
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[11px] font-medium tracking-[0.2em] text-blog-soft uppercase">
            {hasFilter ? "文章筛选" : "最新文章"}
          </h2>
          <div className="flex items-center gap-4">
            {/* 图片开关 */}
            <label className="hidden cursor-pointer items-center gap-2.5 md:flex">
              <span className="text-[11px] tracking-[0.08em] text-blog-soft select-none">
                显示图片
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={showImages}
                onClick={() => setShowImages((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    setShowImages((v) => !v);
                  }
                }}
                className={cn(
                  "relative h-[22px] w-10 rounded-full border transition-colors duration-300",
                  showImages
                    ? "border-blog-ink bg-blog-ink"
                    : "border-blog-line bg-blog-muted",
                )}
              >
                <span
                  className={cn(
                    "absolute top-[3px] h-4 w-4 rounded-full transition-transform duration-300",
                    showImages
                      ? "left-[21px] bg-blog-bg"
                      : "left-[3px] bg-blog-soft",
                  )}
                />
              </button>
            </label>

            {(categoryId || tagId) && (
              <button
                type="button"
                onClick={() => router.replace(pathname)}
                className="text-[12px] text-blog-soft underline decoration-blog-line underline-offset-4 transition-colors hover:text-blog-ink"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        {/* 内容区 */}
        <div
          id="article-list-wrap"
          style={loading && holdHeightRef.current ? { minHeight: holdHeightRef.current } : undefined}
        >
          {loading ? (
            <div
              className="flex items-center justify-center py-16"
              style={holdHeightRef.current ? { minHeight: holdHeightRef.current } : undefined}
            >
              <AiImageGeneration
                className="w-full max-w-[320px]"
                label="正在载入文章"
              />
            </div>
          ) : error ? (
            <ArticleError message={`加载失败: ${error}`} onRetry={() => fetch(current)} />
          ) : articles.length === 0 ? (
            <ArticleEmpty hint="暂无文章" />
          ) : (
            <>
              {/* 桌面 3 列网格 / 移动横排 */}
              <div className="hidden gap-x-6 gap-y-14 md:grid md:grid-cols-2 xl:grid-cols-3">
                {articles.map((a, i) => (
                  <ArticleCard
                    key={a.id}
                    article={a}
                    index={i}
                    hideCover={!showImages}
                  />
                ))}
              </div>
              <div className="space-y-7 md:hidden">
                {articles.map((a, i) => (
                  <ArticleCard
                    key={a.id}
                    article={a}
                    index={i}
                    forceMobile
                    hideCover={!showImages}
                  />
                ))}
              </div>

              <ArticleListPagination
                current={current}
                totalPages={totalPages}
                onChange={(p) => {
                  setCurrent(p);
                  fetch(p);
                }}
              />
            </>
          )}
        </div>
      </main>

      {/* 侧栏 */}
      <aside className="sticky top-28 hidden self-start lg:block">
        <CategorySidebar
          activeId={categoryId}
          onSelect={(id) => setFilter("category", id)}
        />
        <TagSidebar
          activeId={tagId}
          onSelect={(id) => setFilter("tag", id)}
        />
        <RecommendedArticles />
      </aside>

      {/* 移动端：筛选在底部 */}
      <aside className="lg:hidden">
        <CategorySidebar
          activeId={categoryId}
          onSelect={(id) => setFilter("category", id)}
        />
        <TagSidebar
          activeId={tagId}
          onSelect={(id) => setFilter("tag", id)}
        />
        <RecommendedArticles />
      </aside>
    </div>
  );
}