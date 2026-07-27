"use client";

import { useEffect, useState } from "react";

/**
 * 页面阅读进度 0..1。
 * 依据 scrollY / (scrollHeight - viewport) 计算。
 */
export function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const compute = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(1, Math.max(0, window.scrollY / total)));
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return progress;
}
