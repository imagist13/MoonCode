import Link from "next/link";
import { Moon, Github, Rss, Twitter } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  className?: string;
}

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/60 glass",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-moon to-moon-glow shadow-[0_0_18px_-4px_hsl(var(--moon-glow))]">
            <Moon className="h-4 w-4 text-night" strokeWidth={2.4} />
          </span>
          <span className="text-base">{siteConfig.name}</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 text-sm md:flex">
          {[
            { href: "/", label: "首页" },
            { href: "/articles", label: "归档" },
            { href: "/categories", label: "分类" },
            { href: "/tags", label: "标签" },
            { href: "/about", label: "关于" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href as never}
              className="rounded-md px-3 py-1.5 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={siteConfig.social[0].href}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href={siteConfig.social[1].href}
            target="_blank"
            rel="noreferrer"
            aria-label="X"
            className="hidden h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <Link
            href="/rss.xml"
            aria-label="RSS"
            className="hidden h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            <Rss className="h-4 w-4" />
          </Link>
          <ThemeToggle />
          <Link
            href="/admin"
            className="hidden h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:inline-flex"
          >
            写作
          </Link>
        </div>
      </div>
    </header>
  );
}
