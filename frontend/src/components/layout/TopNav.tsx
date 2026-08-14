"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/archives", label: "归档" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/talks", label: "说说" },
  { href: "/links", label: "友链" },
  { href: "/message", label: "留言" },
  { href: "/about", label: "关于" },
];

function getInitialTheme(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("theme");
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function NavLink({
  href,
  label,
  pathname,
  onNavigate,
}: {
  href: string;
  label: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "text-brand-600 dark:text-brand-400"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {label}
      <span
        className={`pointer-events-none absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-linear-to-r from-brand-400 to-brand-600 transition-all duration-300 ${
          isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-50"
        }`}
      />
    </Link>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  const siteConfig = useSiteConfig();
  const [isDark, setIsDark] = useState(getInitialTheme);
  const [sheetOpen, setSheetOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !isDark;
    const apply = () => {
      setIsDark(next);
      localStorage.setItem("theme", next ? "dark" : "light");
    };

    const root = document.documentElement;
    if (
      typeof document.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      root.style.setProperty("--theme-ripple-x", `${x}px`);
      root.style.setProperty("--theme-ripple-y", `${y}px`);
      document.startViewTransition(apply);
    } else {
      apply();
    }
  }, [isDark]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-border/60
                 bg-background/70 backdrop-blur-xl
                 supports-backdrop-filter:bg-background/60
                 shadow-[0_1px_0_0_rgb(0_0_0/0.02)]"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight
                     bg-linear-to-r from-brand-500 via-brand-600 to-purple-500
                     bg-clip-text text-transparent
                     transition-opacity hover:opacity-80"
        >
          {siteConfig?.name || "Blog"}
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              pathname={pathname}
            />
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="切换主题"
            className="relative overflow-hidden transition-all
                       hover:bg-brand-50 hover:text-brand-600
                       dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent md:hidden">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 border-l-brand-100 dark:border-l-brand-900/30"
            >
              <nav className="mt-8 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    pathname={pathname}
                    onNavigate={() => setSheetOpen(false)}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
