"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  level: number;
  text: string;
  id: string;
}

/** 目录组件（spec §4.6 TOC） */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);
  const [collapsed, setCollapsed] = useState(false);

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
      <div className="sticky top-28 rounded-lg border border-gray-200 bg-white p-5 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="mb-3 flex w-full items-center justify-between text-sm font-bold text-gray-900 dark:text-gray-100"
        >
          目录
          <span
            className={cn(
              "inline-block transition-transform",
              collapsed ? "" : "rotate-90",
            )}
          >
            ▸
          </span>
        </button>
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            collapsed ? "max-h-0" : "max-h-[60vh]",
          )}
        >
          <ul className="hide-scrollbar max-h-[280px] space-y-1 overflow-y-auto pr-1 text-sm">
            {headings.map((h) => {
              const isActive = h.id === activeId;
              return (
                <li
                  key={h.id}
                  className={cn(h.level === 3 && "pl-4")}
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
                      "block truncate border-l-2 py-1 pl-3 transition-all",
                      isActive
                        ? "border-blue-500 font-medium text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-600 hover:border-blue-200 hover:text-gray-900 dark:text-gray-400 dark:hover:border-blue-800 dark:hover:text-gray-100",
                    )}
                  >
                    {h.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}