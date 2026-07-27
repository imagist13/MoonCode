import Link from "next/link";
import { primaryNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

/** 顶部站点 header：Logo · 胶囊导航 · 主题 · 登录。 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl italic tracking-tight">
            {siteConfig.name}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            journal
          </span>
        </Link>

        <NavLinks items={primaryNav} className="hidden md:flex" />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
