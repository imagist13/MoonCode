"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  CaretDown,
  List,
  MagnifyingGlass,
  User,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore, useHydrated } from "@/stores/auth";
import { SearchPopover } from "@/components/blog/SearchPopover";
import { PixelToggle } from "@/components/leibox/pixel-toggle/PixelToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/archives", label: "归档" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/talks", label: "说说" },
  { href: "/links", label: "友链" },
  { href: "/message", label: "留言" },
  { href: "/about", label: "关于" },
] as const;

/** 主题切换逻辑（spec §4.9） */
function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(stored === "dark" || (stored === null && prefersDark));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // 像素开关本身承担切换动画，不再叠加全页 view-transition 波纹
  const setDark = useCallback((next: boolean) => {
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, []);

  return { isDark, setDark, mounted };
}

/** 测量并决定可见菜单项数（spec §4.1 菜单溢出策略） */
function useVisibleNavCount(containerRef: React.RefObject<HTMLElement | null>) {
  const [count, setCount] = useState<number>(NAV_LINKS.length);

  useLayoutEffect(() => {
    const measure = () => {
      const ul = containerRef.current?.querySelector(
        "[data-measure-ul]",
      ) as HTMLUListElement | null;
      // 容器本身就是 ref 节点，不能再从它内部查找
      const c = containerRef.current;
      if (!ul || !c) return;
      const items = Array.from(ul.querySelectorAll("li[data-measure-item]")) as HTMLLIElement[];
      const containerWidth = c.clientWidth;
      let acc = 0;
      let visible = 0;
      // 为「更多 ▾」按钮预留约 88px
      const moreWidth = 88;
      for (let i = 0; i < items.length; i++) {
        const w = items[i].offsetWidth;
        if (acc + w + (i < items.length - 1 ? moreWidth : 0) > containerWidth) break;
        acc += w;
        visible = i + 1;
      }
      setCount(visible);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef]);

  return count;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const siteConfig = useSiteConfig();
  const siteName = siteConfig?.name || "博客";
  const { token, user, logout } = useAuthStore();
  const hydrated = useHydrated();
  const { isDark, setDark, mounted } = useTheme();
  const isMobile = useIsMobile();

  // 开关语义：checked = 日间，与 html.dark 相反
  const pixelOptions = useMemo(
    () => ({
      checked: !isDark,
      sound: false,
      height: 250,
      onCheckedChange: (day: boolean) => setDark(!day),
    }),
    [isDark, setDark],
  );

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const visibleCount = useVisibleNavCount(measureContainerRef);

  // 关闭菜单：外部点击
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // 主题行在 header 之外，交互时保持展开，让开关动画完整可见
      if (mobileOpen && !(e.target as HTMLElement).closest("header, [data-mobile-theme]"))
        setMobileOpen(false);
      if (userMenuOpen && !(e.target as HTMLElement).closest(".user-menu-container"))
        setUserMenuOpen(false);
      if (moreMenuOpen && !(e.target as HTMLElement).closest(".more-menu-container"))
        setMoreMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [mobileOpen, userMenuOpen, moreMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/admin/login");
  };

  const visibleLinks = NAV_LINKS.slice(0, visibleCount);
  const overflowLinks = NAV_LINKS.slice(visibleCount);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-blog-line bg-blog-bg/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-full max-w-[1240px] items-center px-4">
          {/* 站点名（spec 4.1） */}
          <Link
            href="/"
            className="shrink-0 truncate text-[15px] font-semibold tracking-[-0.01em] text-blog-ink transition-opacity hover:opacity-60 sm:text-base"
          >
            {siteName}
          </Link>

          {/* 桌面菜单（spec §4.1 溢出策略） */}
          <div
            ref={measureContainerRef}
            data-measure-container
            className="relative mx-6 hidden min-w-0 flex-1 items-center md:flex"
          >
            {/* 可见菜单 */}
            <nav className="flex flex-1 items-center justify-center space-x-8">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[13.5px] font-medium transition-colors duration-200",
                    pathname === link.href
                      ? "text-blog-ink"
                      : "text-blog-soft hover:text-blog-ink",
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* 更多下拉 */}
              {overflowLinks.length > 0 && (
                <div ref={moreMenuRef} className="more-menu-container relative">
                  <button
                    type="button"
                    onClick={() => setMoreMenuOpen((v) => !v)}
                    aria-expanded={moreMenuOpen}
                    className="inline-flex items-center gap-1 text-[13.5px] font-medium text-blog-soft transition-colors hover:text-blog-ink"
                  >
                    更多
                    <CaretDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        moreMenuOpen && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "absolute right-0 top-full z-50 mt-3 w-44 overflow-hidden rounded-xl border border-blog-line bg-blog-surface p-1 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.25)] transition-all duration-200",
                      moreMenuOpen
                        ? "visible opacity-100"
                        : "invisible opacity-0",
                    )}
                  >
                    {overflowLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-[13px] text-blog-soft transition-colors hover:bg-blog-muted hover:text-blog-ink"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {/* 离屏测量副本 */}
            <ul
              data-measure-ul
              aria-hidden="true"
              className="invisible absolute -left-[9999px] top-0 flex space-x-8 whitespace-nowrap"
            >
              {NAV_LINKS.map((link) => (
                <li
                  key={link.href}
                  data-measure-item
                  className="font-medium"
                  style={{ width: `${link.label.length * 14 + 24}px` }}
                >
                  {link.label}
                </li>
              ))}
            </ul>
          </div>

          {/* 右侧操作 */}
          <div className="ml-auto flex items-center gap-1">
            {/* 搜索 */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="搜索"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-blog-soft transition-colors hover:bg-blog-muted hover:text-blog-ink"
            >
              <MagnifyingGlass className="h-[18px] w-[18px]" />
            </button>

            {/* 主题切换：像素日夜开关（spec §4.9）
                外层始终占位，保证导航溢出测量拿到真实宽度 */}
            {!isMobile && (
              <div className="pointer-events-none -mx-[38px] h-[60px] w-[172px] shrink-0">
                {mounted && (
                  <PixelToggle className="h-full w-full" options={pixelOptions} />
                )}
              </div>
            )}

            {/* 用户菜单 */}
            {hydrated && token && user ? (
              <div ref={userMenuRef} className="user-menu-container relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="ml-1 flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-blog-muted"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.nickname} />
                    <AvatarFallback>{user.nickname?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[120px] text-[13px] font-medium text-blog-ink sm:inline">
                    {user.nickname}
                  </span>
                  <CaretDown className="hidden h-4 w-4 text-blog-soft sm:inline" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-44 overflow-hidden rounded-xl border border-blog-line bg-blog-surface p-1 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.25)]">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push("/admin");
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-blog-soft hover:bg-blog-muted hover:text-blog-ink"
                    >
                      进入控制台
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 block w-full rounded-lg border-t border-blog-line px-3 py-2 text-left text-[13px] text-red-500 hover:bg-red-500/10"
                    >
                      登出
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-blog-line px-3.5 py-1.5 text-[13px] font-medium text-blog-ink transition-colors hover:bg-blog-muted"
              >
                <User className="h-4 w-4" />
                登录
              </Link>
            )}

            {/* 移动端汉堡按钮 */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="菜单"
              aria-expanded={mobileOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-blog-soft transition-colors hover:bg-blog-muted hover:text-blog-ink md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 移动端展开菜单 */}
      <div
        className={cn(
          "fixed left-0 right-0 top-16 z-40 overflow-hidden border-t border-blog-line bg-blog-bg/95 backdrop-blur-xl transition-all duration-300 ease-in-out md:hidden",
          mobileOpen
            ? "max-h-[80vh] opacity-100 visible"
            : "max-h-0 opacity-0 invisible",
        )}
      >
        <nav className="container mx-auto space-y-1 px-4 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block w-full rounded-xl px-3 py-3 text-left text-[15px] font-medium text-blog-soft transition-colors hover:bg-blog-muted hover:text-blog-ink"
            >
              {link.label}
            </Link>
          ))}
          {/* 移动端顶栏空间不足，日夜开关放进展开菜单 */}
          {mounted && isMobile && (
            <div
              data-mobile-theme
              className="mt-2 flex items-center justify-between rounded-xl px-3 py-1"
            >
              <span className="text-[15px] font-medium text-blog-soft">日夜主题</span>
              <PixelToggle
                className="h-[70px] w-[200px] shrink-0"
                options={pixelOptions}
              />
            </div>
          )}
          {!hydrated || !token ? (
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block w-full rounded-xl bg-blog-ink px-3 py-3 text-center font-medium text-blog-bg transition-opacity hover:opacity-85"
            >
              登录
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="mt-2 block w-full rounded-xl px-3 py-3 text-left text-[15px] font-medium text-red-500 transition-colors hover:bg-red-500/10"
            >
              登出
            </button>
          )}
        </nav>
      </div>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Header 占位 */}
      <div className="h-16 shrink-0" />

      <SearchPopover open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}