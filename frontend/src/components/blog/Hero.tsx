"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";

export interface HeroPinned {
  id: number;
  articleTitle: string;
  articleCover?: string;
  categoryName?: string;
}

/**
 * Hero 头图（spec §4.2）
 */
export function Hero({
  siteName,
  slogan,
  pinned,
  hasFilter,
}: {
  siteName?: string;
  slogan?: string;
  pinned?: HeroPinned | null;
  hasFilter?: boolean;
}) {
  if (hasFilter) {
    return (
      <div className="mb-12">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-blog-ink md:text-4xl">
          文章筛选
        </h1>
        <p className="mt-3 text-sm text-blog-soft">按条件筛选的文章列表</p>
      </div>
    );
  }

  const title = siteName || "我的博客";
  const subtitle = slogan || "记录技术、分享生活。Stay hungry, stay foolish.";
  const bgCover = "/Hero.jpg";

  return (
    <section className="full-bleed relative -mt-10 mb-14 overflow-hidden bg-[#0b0b0a] md:-mt-14">
      <div className="absolute inset-0">
        <Image
          src={bgCover}
          alt={title}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/80" />
      </div>
      <div className="relative mx-auto w-full max-w-[1200px] px-5 py-28 md:px-8 md:py-40">
        <div className="max-w-3xl">
          {pinned?.categoryName && (
            <p className="mb-5 text-[11px] font-medium tracking-[0.22em] text-white/55 uppercase">
              {pinned.categoryName}
            </p>
          )}
          <h1 className="text-[clamp(2.6rem,6vw,4.75rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
              {subtitle}
            </p>
          )}
          {pinned && (
            <Link
              href={`/articles/${pinned.id}`}
              className="group mt-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:border-white/50 hover:bg-white/10"
            >
              阅读推荐
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}