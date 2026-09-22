"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">文章筛选</h1>
        <p className="mt-1 text-sm text-gray-500">按条件筛选的文章列表</p>
      </div>
    );
  }

  const title = siteName || "我的博客";
  const subtitle = slogan || "记录技术、分享生活。Stay hungry, stay foolish.";
  const bgCover = "/Hero.jpg";

  return (
    <section className="full-bleed relative mb-8 -mt-8 overflow-hidden bg-gray-900">
      <div className="absolute inset-0">
        <Image
          src={bgCover}
          alt={title}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
      </div>
      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-24 md:py-32">
        <div className="max-w-2xl">
          {pinned?.categoryName && (
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur-md">
              {pinned.categoryName}
            </span>
          )}
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            {title}
          </h1>
          {subtitle && <p className="mb-8 text-xl text-gray-200">{subtitle}</p>}
          {pinned && (
            <Link
              href={`/articles/${pinned.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-600"
            >
              阅读推荐
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}