import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MainGridProps {
  children: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

// 12 栅格：主内容 8，侧栏 4，移动端单列
export function MainGrid({ children, sidebar, className }: MainGridProps) {
  return (
    <div
      className={cn(
        "mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:px-8",
        sidebar
          ? "grid-cols-1 lg:grid-cols-12"
          : "grid-cols-1",
        className
      )}
    >
      <main className={cn(sidebar ? "lg:col-span-8" : "")}>{children}</main>
      {sidebar && (
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">{sidebar}</div>
        </aside>
      )}
    </div>
  );
}
