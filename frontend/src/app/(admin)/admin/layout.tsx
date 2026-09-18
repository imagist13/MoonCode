"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, useHydrated } from "@/stores/auth";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

/** 根据 pathname 推导页面标题（spec §5.3 标题动态） */
function titleForPath(pathname: string): string {
  const map: Record<string, string> = {
    "/admin": "仪表盘",
    "/admin/articles": "文章管理",
    "/admin/articles/editor": "编辑文章",
    "/admin/categories": "分类管理",
    "/admin/tags": "标签管理",
    "/admin/comments": "评论管理",
    "/admin/messages": "留言管理",
    "/admin/talks": "说说管理",
    "/admin/albums": "相册管理",
    "/admin/notifications": "通知",
    "/admin/users": "用户管理",
    "/admin/themes": "主题商店",
    "/admin/friend-links": "友情链接",
    "/admin/rbac": "角色权限",
    "/admin/attachments": "附件管理",
    "/admin/update": "更新管理",
    "/admin/settings": "站点设置",
    "/admin/logs": "操作日志",
  };
  return map[pathname] ?? "管理后台";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuthStore();
  const hydrated = useHydrated();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (hydrated && !token && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [hydrated, token, isLoginPage, router]);

  // 登录页：不显示后台框架
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 等待 hydrate / 检查登录
  if (!hydrated || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex w-full flex-1 flex-col overflow-hidden md:w-auto">
        <DashboardHeader title={titleForPath(pathname)} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}