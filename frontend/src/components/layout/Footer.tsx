"use client";

import Link from "next/link";
import { Code, Mail, Rss } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/archives", label: "归档" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/about", label: "关于" },
];

const socials = [
  {
    href: "https://github.com",
    label: "GitHub 仓库",
    icon: Code,
  },
  { href: "mailto:hi@example.com", label: "邮箱", icon: Mail },
  { href: "/rss.xml", label: "RSS", icon: Rss },
];

export default function Footer() {
  const siteConfig = useSiteConfig();
  const siteName = siteConfig?.name || "Blog";

  return (
    <footer className="mt-16 border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo + 简介 */}
          <div className="md:col-span-2">
            <div
              className="text-lg font-bold tracking-tight
                            bg-linear-to-r from-brand-500 via-brand-600 to-purple-500
                            bg-clip-text text-transparent"
            >
              {siteName}
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
              记录技术、分享生活。Stay hungry, stay foolish.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full
                             border border-border/60 text-muted-foreground
                             transition-all hover:-translate-y-0.5 hover:border-brand-300
                             hover:bg-brand-50 hover:text-brand-600
                             dark:hover:border-brand-700 dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* 导航 */}
          <div>
            <h4 className="text-sm font-semibold">导航</h4>
            <ul className="mt-3 space-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 友链 / 关于 */}
          <div>
            <h4 className="text-sm font-semibold">更多</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/links"
                  className="text-muted-foreground transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                >
                  友情链接
                </Link>
              </li>
              <li>
                <Link
                  href="/message"
                  className="text-muted-foreground transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                >
                  留言板
                </Link>
              </li>
              <li>
                <Link
                  href="/talks"
                  className="text-muted-foreground transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                >
                  说说
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col items-start justify-between gap-3
                     border-t border-border/60 pt-6 text-xs text-muted-foreground
                     sm:flex-row sm:items-center"
        >
          <p>
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p>
            Powered by{" "}
            <span className="font-medium text-foreground">Go + Next.js</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
