"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  html: string;
  /** localStorage key，用于「不再提醒」 */
  dismissKey?: string;
  /** 后端的 updateTime，仅当不同时才显示 */
  updateTime?: string;
}

/** 公告弹窗（spec §6.7） */
export function AnnouncementModal({
  open,
  onClose,
  title = "公告",
  html,
  dismissKey = "announcement_dismissed_at",
  updateTime,
}: AnnouncementModalProps) {
  const [sanitizedHtml] = useState(() => {
    if (typeof document === "undefined") return html;
    // 浏览器侧极简 sanitize：移除 <script> 等危险标签
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/ on\w+="[^"]*"/g, "")
      .replace(/ on\w+='[^']*'/g, "");
  });

  // 「不再提醒」机制：仅当 updateTime 与本地记录不同时展示
  useEffect(() => {
    if (!open || !updateTime) return;
    const stored = localStorage.getItem(dismissKey);
    if (stored === updateTime) {
      onClose();
    }
  }, [open, updateTime, dismissKey, onClose]);

  const handleClose = () => {
    if (updateTime) {
      try {
        localStorage.setItem(dismissKey, updateTime);
      } catch {
        /* noop */
      }
    }
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-y-auto p-4">
            <style>{`.announcement-body img { max-width: 100%; height: auto; margin: 0.75em 0; border-radius: 4px; }`}</style>
            <div
              className="announcement-body text-sm text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
            <label className="flex items-center gap-2 text-xs text-gray-500">
              <input type="checkbox" onChange={(e) => {
                if (e.target.checked && updateTime) {
                  try { localStorage.setItem(dismissKey, updateTime); } catch {/* noop */}
                  handleClose();
                }
              }} />
              不再提醒
            </label>
            <button
              type="button"
              onClick={handleClose}
              className="rounded bg-blue-500 px-4 py-1.5 text-sm text-white hover:bg-blue-600"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </>
  );
}