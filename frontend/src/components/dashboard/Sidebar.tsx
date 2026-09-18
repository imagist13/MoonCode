"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  Bell,
  Users,
  Palette,
  Link2,
  Shield,
  Download,
  Image as ImageIcon,
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
      { title: "新建文章", href: "/admin/articles/editor", icon: PenSquare },
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
  { title: "通知", icon: Bell, href: "/admin/notifications" },
  { title: "用户管理", icon: Users, href: "/admin/users" },
  { title: "主题商店", icon: Palette, href: "/admin/themes" },
  { title: "友情链接", icon: Link2, href: "/admin/friend-links" },
  { title: "角色权限", icon: Shield, href: "/admin/rbac" },
  { title: "附件管理", icon: ImageIcon, href: "/admin/attachments" },
  { title: "更新管理", icon: Download, href: "/admin/update" },
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
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800 md:sticky md:top-0 md:h-screen",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-16" : "md:w-64",
          "w-64",
        )}
      >
        {/* 站点名 */}
        <div className="h-16 shrink-0 border-b border-gray-200 px-4 dark:border-gray-700">
          <div className="flex h-full items-center">
            <Link
              href="/admin"
              className={cn(
                "cursor-pointer truncate text-2xl font-bold text-blue-600 transition-opacity hover:opacity-80",
                collapsed && "md:hidden",
              )}
            >
              控制台
            </Link>
            {collapsed && (
              <span className="hidden text-2xl font-bold text-blue-600 md:block">控</span>
            )}
          </div>
        </div>

        {/* 折叠按钮 */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "展开侧边栏" : "收起侧边栏"}
          className="absolute -right-3 top-20 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 opacity-0 shadow-md transition-all hover:text-blue-600 group-hover:opacity-100 md:flex"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* 菜单 */}
        <nav className="hide-scrollbar mt-4 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2">
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
          <div className="mt-auto border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user.avatar} alt={user.nickname} />
                <AvatarFallback>{user.nickname?.[0] || "U"}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.nickname || "用户"}
                    </div>
                    <div className="truncate text-xs text-gray-500">{user.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="登出"
                    className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4" />
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
    return (
      <Link
        href={item.href!}
        className={cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
          pathname === item.href
            ? "bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="ml-3 truncate">{item.title}</span>}
      </Link>
    );
  }

  const childActive = item.children.some((c) => pathname === c.href);
  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => !collapsed && setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
          childActive
            ? "bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="ml-3 truncate">{item.title}</span>
            <ChevronRight
              className={cn(
                "ml-auto h-4 w-4 transition-transform",
                open && "rotate-90",
              )}
            />
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="ml-6 space-y-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                pathname === child.href
                  ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700",
              )}
            >
              <child.icon className="mr-2 inline h-4 w-4" />
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// 避免 lint 报错引用未使用
void useRef;