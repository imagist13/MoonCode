"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

interface TableOfContentsProps {
  items: TocItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (items.length === 0) return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: [0, 1] }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="目录" className={cn("text-sm", className)}>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        目录
      </p>
      <ul className="space-y-1 border-l border-border">
        {items.map((it) => (
          <li key={it.id} style={{ paddingLeft: (it.depth - 1) * 12 }}>
            <a
              href={`#${it.id}`}
              className={cn(
                "-ml-px block border-l py-1 pl-3 pr-2 leading-relaxed transition-colors",
                active === it.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}