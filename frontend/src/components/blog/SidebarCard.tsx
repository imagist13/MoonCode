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
      className={cn("mb-9 border-t border-blog-line pt-5", className)}
    >
      <h3 className="mb-4 flex items-center gap-2 text-[10.5px] font-medium tracking-[0.18em] text-blog-soft uppercase">
        {icon && (
          <span className="inline-flex opacity-70 [&_svg]:h-3.5 [&_svg]:w-3.5">
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