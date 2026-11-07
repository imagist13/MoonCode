"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn, debounce, stripMarkdown } from "@/lib/utils";
import { api } from "@/lib/api";

interface SearchResult {
  id: number;
  articleTitle: string;
  articleContent?: string;
  articleCover?: string;
}

interface SearchPopoverProps {
  open: boolean;
  onClose: () => void;
}

/** 搜索弹窗（spec §4.8） */
export function SearchPopover({ open, onClose }: SearchPopoverProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 防抖搜索
  useEffect(() => {
    if (!open) return;
    const trigger = debounce(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get<{ records: SearchResult[] }>(
          `/articles/condition?current=1&size=10&keyword=${encodeURIComponent(q)}`,
        );
        if (res.flag && res.data) setResults(res.data.records || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    trigger(query);
  }, [query, open]);

  // 自动聚焦
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // body overflow
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed z-50",
          // 移动：贴顶；桌面：右上角弹出
          "right-4 left-4 top-20 md:left-auto md:right-6 md:top-20",
          "md:w-[26rem] md:max-w-[calc(100vw-3rem)]",
        )}
      >
        <div className="overflow-hidden rounded-2xl border border-blog-line bg-blog-surface/95 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {/* 输入区 */}
          <div className="relative border-b border-blog-line">
            <MagnifyingGlass className="absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-blog-soft" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索文章..."
              className="w-full border-0 bg-transparent py-3.5 pr-11 pl-11 text-[14px] text-blog-ink placeholder:text-blog-soft/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1.5 text-blog-soft transition-colors hover:bg-blog-muted hover:text-blog-ink"
              aria-label="关闭搜索"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 结果区 */}
          <div className="max-h-96 space-y-0.5 overflow-y-auto p-1.5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-blog-soft">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-blog-line border-t-blog-ink" />
                搜索中...
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MagnifyingGlass className="mb-2 h-6 w-6 text-blog-soft/50" />
                <p className="text-[12.5px] text-blog-soft">未找到相关文章</p>
              </div>
            ) : results.length > 0 ? (
              results.map((r) => (
                <Link
                  key={r.id}
                  href={`/articles/${r.id}`}
                  onClick={onClose}
                  className="block rounded-xl px-2.5 py-2.5 transition-colors hover:bg-blog-muted"
                >
                  <div className="flex gap-3">
                    {r.articleCover && (
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-blog-muted">
                        <Image
                          src={r.articleCover}
                          alt={r.articleTitle}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-1 text-[13.5px] font-medium text-blog-ink">
                        {r.articleTitle}
                      </h4>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-blog-soft">
                        {stripMarkdown(r.articleContent || "").slice(0, 80)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-[12px] text-blog-soft/70">
                输入关键词开始搜索
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}