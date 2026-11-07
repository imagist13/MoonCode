"use client";

import Link from "next/link";
import { ShieldCheck } from "@phosphor-icons/react";
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

  return (
    <footer className="mt-auto border-t border-blog-line">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 md:px-8">
        <div className="text-[12px] leading-relaxed text-blog-soft">
          <p>{copyright || `© ${new Date().getFullYear()} ${siteName}`}</p>
          {icpRecord && (
            <p className="mt-2">
              <a
                href="https://beian.miit.gov.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-blog-ink"
              >
                <ShieldCheck className="mr-1 inline-block h-3 w-3 align-middle" />
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
                className="transition-colors hover:text-blog-ink"
              >
                {mpsRecord}
              </a>
            </p>
          )}
          <p className="mt-3">
            Powered by{" "}
            <Link
              href="/"
              className="font-medium text-blog-ink transition-opacity hover:opacity-60"
            >
              {siteName}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}