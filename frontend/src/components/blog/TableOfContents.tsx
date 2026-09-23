"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  level: number;
  text: string;
  id: string;
}

/** 目录组件（spec §4.6 TOC，仿 Simon Willison 风格） */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

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
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden w-full lg:block">
      <nav className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
        <div className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          本页
        </div>
        <ul className="space-y-0.5 border-l border-gray-200 pl-0 text-sm dark:border-gray-700">
          {headings.map((h) => {
            const isActive = h.id === activeId;
            return (
              <li
                key={h.id}
                className={cn(h.level === 3 && "ml-3")}
              >
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(h.id);
                    if (el) {
                      const y =
                        el.getBoundingClientRect().top +
                        window.scrollY -
                        80;
                      window.scrollTo({ top: y, behavior: "smooth" });
                      setActiveId(h.id);
                    }
                  }}
                  className={cn(
                    "-ml-px block border-l-2 py-1.5 pl-3 pr-2 leading-snug transition-all duration-200",
                    h.level === 3 && "text-[13px]",
                    isActive
                      ? "border-violet-500 font-medium text-violet-600 dark:border-violet-400 dark:text-violet-300"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-100",
                  )}
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