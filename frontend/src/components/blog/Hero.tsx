"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";

interface PinnedArticle {
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
  pinned?: PinnedArticle | null;
  hasFilter?: boolean;
}

function stripMarkdown(s: string): string {
  return s.replace(/[#*`>\-\[\]()_~]/g, "").replace(/\s+/g, " ").trim();
}

export function Hero({ siteName, slogan, pinned, hasFilter }: HeroProps) {
  // 筛选态：只显示一行提示
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

  // 默认态：极简单标题 + 一句话（不渲染置顶卡，置顶逻辑下放到右栏"今日推荐"）
  return (
    <section className="mb-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        {siteName || "我的博客"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {slogan || "记录技术、分享生活。Stay hungry, stay foolish."}
      </p>
    </section>
  );
}
