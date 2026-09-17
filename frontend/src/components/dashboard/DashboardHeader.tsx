"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Moon, Sun, ChevronDown, LogOut, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore, useHydrated } from "@/stores/auth";
import { cn } from "@/lib/utils";

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
    <header className="h-16 shrink-0 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="切换侧栏"
            className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition-all active:scale-95 hover:bg-gray-50 md:hidden dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-blue-600">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          {mounted && (
            <button
              type="button"
              onClick={toggle}
              aria-label="切换主题"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {hydrated && user && (
            <div ref={menuRef} className="user-menu-container relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.nickname} />
                  <AvatarFallback>{user.nickname?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-gray-700 sm:inline dark:text-gray-200">
                  {user.nickname}
                </span>
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Globe className="h-4 w-4" />
                    返回网站
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      router.push("/admin/login");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4" />
                    登出
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// 避免 lint 报错
void cn;