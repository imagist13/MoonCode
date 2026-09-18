"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

/** 主题切换（极简版） */
function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(stored === "dark" || (stored === null && prefersDark));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (!mounted) {
    return <span className="inline-block h-9 w-9" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="切换主题"
      className="inline-flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

/** 鉴权页面外壳：顶部站点名 + 主题切换，下方内容居中 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const siteConfig = useSiteConfig();
  const siteName = siteConfig?.name || "Moon";

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="flex h-16 items-center justify-between px-6">
        <Link
          href="/"
          className="text-base font-medium tracking-tight text-gray-900 transition-opacity hover:opacity-60 dark:text-gray-100"
        >
          ← {siteName}
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-start justify-center px-6 pb-16 pt-12 sm:pt-24">
        <div className="w-full max-w-[360px]">{children}</div>
      </main>
    </div>
  );
}