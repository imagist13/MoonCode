"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import {
  TalkItem,
  talkTimestamp,
  type Talk,
} from "@/components/blog/TalkItem";
import { ImageLightbox } from "@/components/lightbox/ImageLightbox";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface PageResult {
  records: Talk[];
  count: number;
}

const PAGE_SIZE = 10;

function TalkSkeleton() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex gap-3 border-b border-blog-line/80 py-4"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
            {index === 0 && <Skeleton className="h-44 w-full rounded-2xl" />}
            <div className="flex gap-6 pt-1">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TalksPage() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const initialLoadedRef = useRef(false);

  const loadTalks = useCallback(async (targetPage: number, append: boolean) => {
    setError("");
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await api.get<PageResult>(
        `/talks?current=${targetPage}&size=${PAGE_SIZE}`,
      );
      if (!res.flag || !res.data) throw new Error(res.message || "加载失败");

      const records = res.data.records ?? [];
      setTalks((prev) => {
        if (!append) return records;
        // 翻页期间若有新说说插入，按 id 去重，避免重复渲染
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...records.filter((item) => !seen.has(item.id))];
      });
      setTotal(res.data.count ?? 0);
      setPage(targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    // StrictMode 下 effect 会执行两次，首次加载只发一次请求
    if (initialLoadedRef.current) return;
    initialLoadedRef.current = true;
    void loadTalks(1, false);
  }, [loadTalks]);

  const hasMore = talks.length < total;

  const loadMore = useCallback(() => {
    if (loading || loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    void loadTalks(page + 1, true).finally(() => {
      loadingMoreRef.current = false;
    });
  }, [hasMore, loadTalks, loading, page]);

  // 滚动到接近底部时自动续页，底部同时保留「加载更多」按钮
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || loading || !hasMore || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [error, hasMore, loadMore, loading]);

  // 后端按 id 排序；这里按时间重排，保证置顶之后的时间线始终由新到旧
  const timeline = useMemo(
    () =>
      [...talks].sort((a, b) => {
        if (a.isTop !== b.isTop) return a.isTop ? -1 : 1;
        return talkTimestamp(b.createTime) - talkTimestamp(a.createTime);
      }),
    [talks],
  );

  const openMedia = useCallback((images: string[], index: number) => {
    setLightbox({ images, index });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const lightboxImages = useMemo(
    () => (lightbox?.images ?? []).map((src) => ({ src })),
    [lightbox],
  );

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="sr-only">说说</h1>

      {loading && talks.length === 0 ? (
        <TalkSkeleton />
      ) : error && talks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-[13px] text-blog-soft">
          <p>加载失败：{error}</p>
          <button
            type="button"
            onClick={() => void loadTalks(1, false)}
            className="rounded-full border border-blog-line px-4 py-1.5 text-[12.5px] text-blog-ink transition-colors hover:bg-blog-muted"
          >
            重试
          </button>
        </div>
      ) : (
        <>
          {timeline.map((talk) => (
            <TalkItem key={talk.id} talk={talk} onOpenMedia={openMedia} />
          ))}

          {timeline.length === 0 && (
            <div className="py-16 text-center text-[13px] text-blog-soft">
              暂无说说
            </div>
          )}

          <div
            ref={loadMoreRef}
            className="flex min-h-[56px] items-center justify-center py-5 text-[12.5px] text-blog-soft"
          >
            {error ? (
              <button
                type="button"
                onClick={loadMore}
                className="rounded-full border border-blog-line px-4 py-1.5 text-blog-ink transition-colors hover:bg-blog-muted"
              >
                加载失败，点击重试
              </button>
            ) : loadingMore ? (
              <span className="inline-flex items-center gap-2">
                <CircleNotch className="h-4 w-4 animate-spin" />
                正在加载
              </span>
            ) : hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                className="rounded-full px-4 py-1.5 transition-colors hover:bg-blog-muted hover:text-blog-ink"
              >
                加载更多
              </button>
            ) : talks.length > 0 ? (
              <span>已经到底了</span>
            ) : null}
          </div>
        </>
      )}

      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightbox?.index ?? 0}
        open={!!lightbox}
        onClose={closeLightbox}
      />
    </div>
  );
}
