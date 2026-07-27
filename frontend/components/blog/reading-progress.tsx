"use client";

import { useReadingProgress } from "@/hooks/use-reading-progress";

/** 顶部阅读进度条。 */
export function ReadingProgress() {
  const progress = useReadingProgress();
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
      <div
        className="h-full origin-left bg-gradient-to-r from-primary to-pink-500 transition-transform"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
