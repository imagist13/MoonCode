"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Moon, Sun, ChevronDown, ChevronRight, LogOut, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore, useHydrated } from "@/stores/auth";

/** DashboardHeader（spec §5.3） */
export function DashboardHeader({
  title,
  onToggleSidebar,
}: {
  title: string;
  onToggleSidebar: () => void;
}) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const hydrated = useHydrated();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    setIsDark(stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuOpen && !(e.target as HTMLElement).closest(".user-menu-container")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [menuOpen]);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !isDark;
    const apply = () => {
      setIsDark(next);
      localStorage.setItem("theme", next ? "dark" : "light");
    };
    if (typeof document.startViewTransition === "function") {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      document.documentElement.style.setProperty("--theme-ripple-x", `${x}px`);
      document.documentElement.style.setProperty("--theme-ripple-y", `${y}px`);
      document.startViewTransition(apply);
    } else {
      apply();
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="切换侧栏"
          className="mr-1 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 md:hidden"
        >
          <Menu className="size-4" />
        </button>

        {/* 面包屑（替代重复的页面大标题） */}
        <nav aria-label="面包屑" className="flex min-w-0 items-center gap-1.5 text-[12.5px]">
          <Link
            href="/admin"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            控制台
          </Link>
          <ChevronRight className="size-3 shrink-0 text-muted-foreground/50" />
          <span className="truncate font-medium text-foreground">{title}</span>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Link
          href="/"
          className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
        >
          <Globe className="size-3.5" />
          返回网站
        </Link>

        {mounted && (
          <button
            type="button"
            onClick={toggle}
            aria-label="切换主题"
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        )}

        {hydrated && user && (
          <>
            <span className="mx-1 hidden h-4 w-px bg-border sm:block" />
            <div ref={menuRef} className="user-menu-container relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg py-1 pr-1 pl-1.5 transition-colors hover:bg-muted"
              >
                <Avatar className="size-[26px]">
                  <AvatarImage src={user.avatar} alt={user.nickname} />
                  <AvatarFallback className="text-[10px]">{user.nickname?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-28 truncate text-[12.5px] font-medium text-foreground sm:inline">
                  {user.nickname}
                </span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </button>

              {menuOpen && (
                <div className="absolute top-full right-0 z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg">
                  <div className="px-2.5 py-2">
                    <p className="truncate text-[12px] font-medium text-foreground">
                      {user.nickname || "用户"}
                    </p>
                    <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/");
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12.5px] text-foreground transition-colors hover:bg-muted"
                  >
                    <Globe className="size-3.5 text-muted-foreground" />
                    返回网站
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      router.push("/admin/login");
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12.5px] text-destructive transition-colors hover:bg-muted"
                  >
                    <LogOut className="size-3.5" />
                    登出
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
