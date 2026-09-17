"use client";

import Link from "next/link";
import { Code, Mail, Rss, Shield } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

interface FooterProps {
  copyright?: string;
  icpRecord?: string;
  mpsRecord?: string;
  footerCode?: string;
}

export default function Footer({
  copyright,
  icpRecord,
  mpsRecord,
}: FooterProps) {
  const siteConfig = useSiteConfig();
  const siteName = siteConfig?.name || "Blog";

  const socials = [
    { href: "https://github.com", label: "GitHub 仓库", icon: Code },
    { href: "mailto:hi@example.com", label: "邮箱", icon: Mail },
    { href: "/rss.xml", label: "RSS", icon: Rss },
  ];

  return (
    <footer className="mt-auto bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>{copyright || `© ${new Date().getFullYear()} ${siteName}`}</p>
          {icpRecord && (
            <p className="mt-2">
              <a
                href="https://beian.miit.gov.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                <Shield className="mr-1 inline-block h-3 w-3 align-middle" />
                {icpRecord}
              </a>
            </p>
          )}
          {mpsRecord && (
            <p className="mt-1">
              <a
                href="http://www.beian.gov.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                {mpsRecord}
              </a>
            </p>
          )}
          <p className="mt-2">
            Powered by{" "}
            <Link
              href="/"
              className="font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
            >
              {siteName}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}