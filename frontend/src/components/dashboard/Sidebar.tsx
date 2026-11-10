"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  MessageSquare,
  Mail,
  Settings,
  ScrollText,
  ChevronRight,
  ChevronLeft,
  LogOut,
  PenSquare,
  List,
  MessageCircle,
  Camera,
  Music2,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore, useHydrated } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavChild {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface NavItem {
  title: string;
  icon: LucideIcon;
  href?: string;
  children?: NavChild[];
}

/** 与 spec §3 路由结构对齐的菜单（不含未实现模块） */
export const NAV_ITEMS: NavItem[] = [
  { title: "仪表盘", icon: LayoutDashboard, href: "/admin" },
  {
    title: "文章管理",
    icon: FileText,
    children: [
      { title: "新建文章", href: "/admin/articles/create", icon: PenSquare },
      { title: "文章列表", href: "/admin/articles", icon: List },
      { title: "分类管理", href: "/admin/categories", icon: FolderTree },
      { title: "标签管理", href: "/admin/tags", icon: Tags },
    ],
  },
  {
    title: "评论审核",
    icon: MessageSquare,
    href: "/admin/comments",
  },
  { title: "留言管理", icon: Mail, href: "/admin/messages" },
  { title: "说说管理", icon: MessageCircle, href: "/admin/talks" },
  { title: "相册管理", icon: Camera, href: "/admin/albums" },
  { title: "音乐管理", icon: Music2, href: "/admin/music" },
  { title: "站点设置", icon: Settings, href: "/admin/settings" },
  { title: "操作日志", icon: ScrollText, href: "/admin/logs" },
];

/** Sidebar（spec §5.2） */
export function DashboardSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const hydrated = useHydrated();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/15 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "group fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-border bg-background transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-16" : "md:w-60",
          "w-60",
        )}
      >
        {/* 品牌区 */}
        <div className="h-14 shrink-0 border-b border-border px-4">
          <div className="flex h-full items-center">
            <Link
              href="/admin"
              className={cn(
                "flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-70",
                collapsed && "md:justify-center",
              )}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <Moon className="size-3.5" strokeWidth={2} />
              </span>
              <span
                className={cn(
                  "flex min-w-0 flex-col leading-none",
                  collapsed && "md:hidden",
                )}
              >
                <span className="truncate text-[14px] font-semibold tracking-[-0.01em] text-foreground">
                  控制台
                </span>
                <span className="mt-1 text-[8.5px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                  Admin
                </span>
              </span>
            </Link>
          </div>
        </div>

        {/* 折叠按钮 */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "展开侧边栏" : "收起侧边栏"}
          className="absolute -right-3 top-[60px] z-10 hidden size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-foreground group-hover:opacity-100 md:flex"
        >
          {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
        </button>

        {/* 菜单 */}
        <nav className="hide-scrollbar mt-3 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2.5 [&_svg]:stroke-[1.7]">
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.title}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* 底部用户信息 */}
        {hydrated && user && (
          <div className="mt-auto border-t border-border p-3">
            <div className={cn("flex items-center gap-2.5", collapsed && "md:justify-center")}>
              <Avatar className="size-7 shrink-0">
                <AvatarImage src={user.avatar} alt={user.nickname} />
                <AvatarFallback className="text-[11px]">{user.nickname?.[0] || "U"}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-medium text-foreground">
                      {user.nickname || "用户"}
                    </div>
                    <div className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="登出"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  >
                    <LogOut className="size-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function SidebarNavItem({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  if (!item.children) {
    return <SidebarLeafItem item={item} pathname={pathname} collapsed={collapsed} />;
  }
  return <SidebarGroupItem item={item} pathname={pathname} collapsed={collapsed} />;
}

function SidebarLeafItem({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const active = pathname === item.href;

  return (
    <Link
      href={item.href!}
      title={collapsed ? item.title : undefined}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors duration-150",
        collapsed && "md:justify-center md:px-0",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {active && (
        <span className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-[var(--admin-accent)]" />
      )}
      <item.icon className="size-[15px] shrink-0" />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </Link>
  );
}

function SidebarGroupItem({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const childActive = item.children!.some((c) => pathname === c.href);
  const [open, setOpen] = useState(childActive);
  const [prevActive, setPrevActive] = useState(childActive);

  // 渲染期间同步：导航到子路由时自动展开分组
  if (prevActive !== childActive) {
    setPrevActive(childActive);
    if (childActive) setOpen(true);
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => !collapsed && setOpen((v) => !v)}
        title={collapsed ? item.title : undefined}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors duration-150",
          collapsed && "md:justify-center md:px-0",
          childActive
            ? "font-medium text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <item.icon className="size-[15px] shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate">{item.title}</span>
            <ChevronRight
              className={cn(
                "ml-auto size-3.5 text-muted-foreground/70 transition-transform duration-200",
                open && "rotate-90",
              )}
            />
          </>
        )}
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-in-out",
          open && !collapsed ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-0.5 ml-[19px] space-y-0.5 border-l border-border py-0.5 pl-2.5">
            {item.children!.map((child) => {
              const active = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "block truncate rounded-md px-2 py-[5px] text-[12.5px] transition-colors duration-150",
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {child.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
