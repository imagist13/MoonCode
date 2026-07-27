"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { adminNav } from "@/config/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/** 后台侧栏（240px）。 */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border/60 md:bg-muted/30">
      <div className="flex h-16 items-center px-6">
        <span className="font-serif text-xl italic">Moon</span>
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          admin
        </span>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3">
        {adminNav.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label + item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <form action="/api/auth/logout" method="POST">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <LogOut className="size-4" />
            退出
          </Button>
        </form>
      </div>
    </aside>
  );
}
