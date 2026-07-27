import Link from "next/link";
import { siteConfig } from "@/config/site";

/** 站点页脚。 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-xl italic text-foreground">
            {siteConfig.name}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
            © {new Date().getFullYear()}
          </span>
        </div>
        <nav className="flex gap-6 font-mono text-xs uppercase tracking-[0.14em]">
          <Link href="/articles" className="hover:text-foreground">
            Articles
          </Link>
          <Link href="/categories" className="hover:text-foreground">
            Categories
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
