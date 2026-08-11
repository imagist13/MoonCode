"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import {
  LayoutDashboard,
  FileText,
  PenLine,
  FolderTree,
  Tag as TagIcon,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/articles", label: "文章", icon: FileText },
  { href: "/admin/articles/new", label: "写文章", icon: PenLine },
  { href: "/admin/categories", label: "分类", icon: FolderTree },
  { href: "/admin/tags", label: "标签", icon: TagIcon },
  { href: "/admin/account", label: "账号", icon: UserIcon },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clear } = useSessionStore();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clear();
    router.push("/login" as never);
    router.refresh();
  };

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card/40 lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col">
        <div className="border-b border-border px-5 py-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            已登录
          </p>
          <p className="mt-1 truncate text-sm font-medium">
            {user?.nickname || user?.username || "用户"}
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {items.map((it) => {
              const active =
                pathname === it.href ||
                (it.href !== "/admin" && pathname.startsWith(it.href + "/"));
              const Icon = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href as never}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <button
          onClick={logout}
          className="m-3 inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </aside>
  );
}