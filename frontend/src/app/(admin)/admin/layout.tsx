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
    "/admin/articles/create": "写文章",
    "/admin/categories": "分类管理",
    "/admin/tags": "标签管理",
    "/admin/comments": "评论管理",
    "/admin/messages": "留言管理",
    "/admin/talks": "说说管理",
    "/admin/albums": "相册管理",
    "/admin/music": "音乐管理",
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

  // 后台主题作用域：挂在 <html> 上，让 portal（对话框/下拉）也继承 token。
  // 登录页保持原样，不加 admin-theme。
  useEffect(() => {
    const root = document.documentElement;
    if (isLoginPage) {
      root.classList.remove("admin-theme");
      return;
    }
    root.classList.add("admin-theme");
    return () => root.classList.remove("admin-theme");
  }, [isLoginPage]);

  // 登录页：不显示后台框架
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 等待 hydrate / 检查登录
  if (!hydrated || !token) {
    return (
      <div className="admin-theme flex h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex items-center gap-2.5 text-[13px]">
          <span className="size-1.5 animate-pulse rounded-full bg-foreground" />
          正在加载…
        </div>
      </div>
    );
  }

  return (
    <div className="admin-theme flex h-screen overflow-hidden bg-background text-foreground">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader title={titleForPath(pathname)} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}