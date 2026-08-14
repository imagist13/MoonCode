"use client";

import { useEffect, useState } from "react";

/**
 * 顶部固定阅读进度条（蓝色，0.5px 高）
 * 通过 --progress CSS 变量驱动 transform: scaleX
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop || document.body.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const ratio = max > 0 ? scrolled / max : 0;
      setProgress(Math.min(Math.max(ratio, 0), 1));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="reading-progress-bar"
      style={{ ["--progress" as string]: String(progress) }}
      aria-hidden
    />
  );
}
