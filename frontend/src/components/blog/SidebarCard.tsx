"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** 侧栏三件套统一外壳（spec §4.5.1） */
export function SidebarCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mb-5 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-700/80 dark:bg-gray-800",
        className,
      )}
    >
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
        {icon && (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            {icon}
          </span>
        )}
        {title}
      </h3>
      {children}
    </section>
  );
}

/** 带渐隐滚动效果的滚动容器（spec §4.5.2） */
export function FadeScrollContainer({
  children,
  maxHeight = "15rem",
  className,
}: {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setShowTop(el.scrollTop > 8);
      setShowBottom(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div
        className="fade-mask-top"
        style={{ opacity: showTop ? 1 : 0 }}
      />
      <div
        ref={ref}
        className="hide-scrollbar overflow-y-auto pr-2"
        style={{ maxHeight }}
      >
        {children}
      </div>
      <div
        className="fade-mask-bottom"
        style={{ opacity: showBottom ? 1 : 0 }}
      />
    </div>
  );
}