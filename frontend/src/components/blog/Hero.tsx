"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export interface HeroPinned {
  id: number;
  articleTitle: string;
  articleCover?: string;
  categoryName?: string;
  articleContent?: string;
  createTime?: string;
}

interface HeroProps {
  siteName?: string;
  slogan?: string;
  pinned?: HeroPinned | null;
  hasFilter?: boolean;
}

export function Hero({ siteName, slogan, pinned, hasFilter }: HeroProps) {
  // 筛选态：只显示一行提示（保留原行为）
  if (hasFilter) {
    return (
      <div className="relative mb-8 overflow-hidden">
        <h1 className="text-2xl font-semibold tracking-tight">文章筛选</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          按条件筛选的文章列表
        </p>
      </div>
    );
  }

  const title = siteName || "我的博客";
  const subtitle =
    slogan || "记录技术、分享生活。Stay hungry, stay foolish.";
  // 优先用置顶文章封面，没有则用本地 Hero.jpg
  const bgCover = "/Hero.jpg";

  return (
    <section className="group relative mb-10 overflow-hidden rounded-2xl border border-border/60 shadow-(--shadow-card-hover)">
      {/* 背景层 */}
      <div className="absolute inset-0">
        <Image
          src={bgCover}
          alt={title}
          fill
          sizes="(min-width: 1024px) 1024px, 100vw"
          priority
          className="object-cover"
        />
        {/* 左侧加深蒙版，保证左下文字可读；右侧稍亮，给推荐卡留呼吸感 */}
        <div className="absolute inset-0 bg-linear-to-r
                        from-black/85 via-black/55 to-black/30
                        dark:from-black/90 dark:via-black/60 dark:to-black/35" />
        <div className="absolute inset-x-0 top-0 h-px
                        bg-linear-to-r from-transparent via-white/60 to-transparent" />
      </div>

      {/* 内容层 */}
      <div className="relative flex min-h-85 flex-col justify-end gap-4
                      p-6 sm:min-h-105 sm:p-10">
        {/* 左下：玻璃面板 */}
        <div className="flex flex-col gap-4 text-white">
          {/* 顶部小条：玻璃风格统一 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full
                             bg-white/10 px-3 py-1 text-[11px] font-medium
                             uppercase tracking-[0.2em] text-white/90
                             backdrop-blur-md ring-1 ring-white/25">
              <Sparkles className="h-3 w-3" />
              Welcome
            </span>
            {pinned?.categoryName && (
              <span className="rounded-full bg-brand-500/80 px-3 py-1
                               text-[11px] font-medium uppercase
                               tracking-[0.2em] text-white backdrop-blur-md
                               ring-1 ring-brand-300/40">
                {pinned.categoryName}
              </span>
            )}
          </div>

          {/* 主标题 + 副标题：玻璃面板（统一样式） */}
          <div className="max-w-xl rounded-2xl border border-white/15
                          bg-white/8 p-5 shadow-2xl shadow-black/30
                          backdrop-blur-2xl
                          sm:p-7">
            <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-1
                           text-2xl font-bold leading-tight tracking-tight
                           text-white sm:text-3xl lg:text-[2.5rem]">
              <span className="text-white/95">欢迎来到</span>
              <span className="relative inline-block bg-linear-to-r
                               from-white via-brand-200 to-white
                               bg-clip-text text-transparent
                               drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                {title}
                <span className="absolute -bottom-1 left-0 h-0.5 w-full
                                 rounded-full bg-linear-to-r
                                 from-transparent via-white/80 to-transparent" />
              </span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-[15px]">
              {subtitle}
            </p>
          </div>

          {/* CTA */}
          <Link
            href="#articles"
            className="group/cta inline-flex w-fit items-center gap-2
                       rounded-full border border-white/20 bg-white/15
                       px-5 py-2 text-sm font-medium text-white
                       backdrop-blur-md transition-all
                       hover:border-white/40 hover:bg-white/25
                       hover:shadow-lg hover:shadow-black/20"
          >
            开始阅读
            <ArrowRight className="h-4 w-4 transition-transform
                                    group-hover/cta:translate-x-0.5" />
          </Link>
        </div>

        {/* 右下空间（当前留空，文字面板独占视觉中心） */}
      </div>
    </section>
  );
}