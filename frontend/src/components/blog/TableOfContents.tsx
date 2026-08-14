"use client";

import { useEffect, useState } from "react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

/**
 * 文章右侧 sticky 目录
 * - IntersectionObserver 监听 h2/h3 进入视口，高亮当前章节
 * - 点击平滑滚动 + offsetTop 修正（避免被 sticky header 遮挡）
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(
    headings[0]?.id ?? null,
  );

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top,
          );
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: [0, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <span className="inline-block h-4 w-0.5 rounded-full bg-linear-to-b from-brand-400 to-brand-600" />
          目录
        </h4>
        <ul className="space-y-1 text-sm">
          {headings.map((h) => {
            const isActive = h.id === activeId;
            return (
              <li
                key={h.id}
                className={`relative ${h.level === 3 ? "pl-4" : ""}`}
              >
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(h.id);
                    if (el) {
                      const offset = 80;
                      const y =
                        el.getBoundingClientRect().top +
                        window.scrollY -
                        offset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                      setActiveId(h.id);
                    }
                  }}
                  className={`block truncate border-l-2 py-1 pl-3 transition-all ${
                    isActive
                      ? "border-brand-500 font-medium text-brand-600 dark:text-brand-400"
                      : "border-transparent text-muted-foreground hover:border-brand-200 hover:text-foreground dark:hover:border-brand-800"
                  }`}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
