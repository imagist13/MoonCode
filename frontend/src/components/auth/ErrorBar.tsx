"use client";

import { useEffect, useState } from "react";

interface ErrorBarProps {
  message: string | null;
  /** 自动消失时间（毫秒），0 表示不自动消失 */
  autoDismissMs?: number;
  onDismiss?: () => void;
}

/** 极简错误条：细条、淡红背景、自动 5 秒消失 */
export function ErrorBar({ message, autoDismissMs = 5000, onDismiss }: ErrorBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    if (autoDismissMs > 0) {
      const t = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoDismissMs);
      return () => clearTimeout(t);
    }
  }, [message, autoDismissMs, onDismiss]);

  if (!message || !visible) return null;

  return (
    <div
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
    >
      {message}
    </div>
  );
}