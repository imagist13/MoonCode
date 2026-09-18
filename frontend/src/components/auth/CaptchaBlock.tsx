"use client";

import { ArrowRight, RefreshCw } from "lucide-react";
import { useState } from "react";

interface CaptchaBlockProps {
  value: string;
  onChange: (v: string) => void;
  src?: string;
  onRefresh?: () => void;
}

/** 验证码：输入 + 简易刷新按钮（可被后端图片替换） */
export function CaptchaBlock({ value, onChange, src, onRefresh }: CaptchaBlockProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    onRefresh?.();
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400">
        验证码
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="请输入验证码"
          maxLength={6}
          className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:ring-0 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:border-gray-100"
        />
        <button
          type="button"
          onClick={handleRefresh}
          aria-label="刷新验证码"
          className="inline-flex h-[38px] w-[88px] shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-gray-900 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:border-gray-100 dark:hover:text-gray-100"
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={refreshKey}
              src={src}
              alt="验证码"
              className="h-full w-full rounded-md object-cover"
            />
          ) : (
            <span className="inline-flex items-center gap-1 text-xs">
              <RefreshCw className="h-3 w-3" />
              获取
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/** 页脚切换链接（右箭头样式） */
export function SwitchLink({
  label,
  cta,
  onClick,
}: {
  label: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
    >
      <span>{label}</span>
      <span className="underline-offset-4 group-hover:underline">{cta}</span>
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}