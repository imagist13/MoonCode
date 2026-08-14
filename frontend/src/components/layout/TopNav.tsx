"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, Sun, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useAuthStore, useHydrated } from "@/stores/auth";
import { useRouter } from "next/navigation";

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
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "text-brand-600 dark:text-brand-400"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const siteConfig = useSiteConfig();
  const [isDark, setIsDark] = useState(getInitialTheme);
  const [sheetOpen, setSheetOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { token, user, logout } = useAuthStore();
  const hydrated = useHydrated();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
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
    },
    [isDark],
  );

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-border/60
                 bg-background/80 backdrop-blur-xl
                 supports-backdrop-filter:bg-background/60"
    >
      <div className="relative mx-auto flex h-16 max-w-6xl items-center px-4">
        {/* 最左侧：logo */}
        <Link
          href="/"
          aria-label="首页"
          className="inline-flex items-center text-lg font-bold tracking-tight
                     transition-opacity hover:opacity-80"
        >
          <span className="text-brand-500">Blogs</span>
        </Link>

        {/* 居中：导航 */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* 右侧：主题 + 登录/头像 */}
        <div className="ml-auto flex items-center gap-1">
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

          {hydrated && token && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-8 w-8 items-center justify-center rounded-full
                           transition-all hover:ring-2 hover:ring-brand-300
                           hover:ring-offset-2 hover:ring-offset-background"
                aria-label="用户菜单"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.nickname} />
                  <AvatarFallback>
                    {user.nickname?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => router.push("/admin")}>
                  进入后台
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/admin/login"
              className="ml-1 inline-flex h-8 items-center gap-1 rounded-full
                         bg-brand-500 px-3 text-sm font-medium text-white
                         shadow-sm shadow-brand-500/30
                         transition-all hover:bg-brand-600 hover:shadow-md
                         hover:shadow-brand-500/30"
            >
              <User className="h-3.5 w-3.5" />
              登录
            </Link>
          )}

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
