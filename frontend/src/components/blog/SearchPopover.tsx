"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
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
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed z-50",
          // 移动：贴顶；桌面：右上角弹出
          "right-4 left-4 top-20 md:left-auto md:right-4 md:top-20",
          "md:w-96 md:max-w-[calc(100vw-2rem)]",
        )}
      >
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/90 shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/90">
          {/* 输入区 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索文章..."
              className="w-full rounded-xl border-0 bg-white/80 px-5 py-3 pl-12 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/80 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
              aria-label="关闭搜索"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 结果区 */}
          <div className="mt-3 max-h-96 space-y-1 overflow-y-auto px-2 pb-3">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
                <span className="h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-blue-500" />
                搜索中...
              </div>
            ) : query.trim() && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-2 text-3xl">🔍</div>
                <p className="text-sm text-gray-500">未找到相关文章</p>
              </div>
            ) : results.length > 0 ? (
              results.map((r) => (
                <Link
                  key={r.id}
                  href={`/articles/${r.id}`}
                  onClick={onClose}
                  className="block rounded-xl border border-transparent p-3 transition-colors hover:border-blue-100 hover:bg-blue-50 dark:hover:border-blue-900/40 dark:hover:bg-blue-900/20"
                >
                  <div className="flex gap-3">
                    {r.articleCover && (
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
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
                      <h4 className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {r.articleTitle}
                      </h4>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                        {stripMarkdown(r.articleContent || "").slice(0, 80)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-xs text-gray-400">
                输入关键词开始搜索
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}