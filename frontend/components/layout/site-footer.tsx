import { Github, Rss, Twitter } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-tight">
            {siteConfig.title}
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">导航</p>
          <ul className="mt-3 space-y-1.5">
            <li>
              <Link href="/articles" className="hover:text-foreground">
                文章归档
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-foreground">
                分类
              </Link>
            </li>
            <li>
              <Link href="/tags" className="hover:text-foreground">
                标签
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-foreground">
                关于
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">联系</p>
          <div className="mt-3 flex items-center gap-3">
            <a
              href={siteConfig.social[0].href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.social[1].href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted hover:text-foreground"
              aria-label="X"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <Link
              href="/rss.xml"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted hover:text-foreground"
              aria-label="RSS"
            >
              <Rss className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {siteConfig.name} · Built with Next.js &amp;
          Go.
        </p>
      </div>
    </footer>
  );
}
