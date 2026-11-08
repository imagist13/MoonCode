"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  Heart,
  LinkSimple,
  PushPin,
  ShareNetwork,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Talk {
  id: number;
  nickname: string;
  avatar: string;
  content: string;
  imgList: string[] | null;
  isTop: boolean;
  likeCount?: number;
  createTime: string;
}

interface TalkItemProps {
  talk: Talk;
  onOpenMedia: (images: string[], index: number) => void;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  // 后端返回 "YYYY-MM-DD HH:mm:ss"，补上 T 以兼容 Safari
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatFullDate(value: string): string {
  const date = parseDate(value);
  if (!date) return value;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 说说时间：一周内用相对时间，更早显示日期，贴近 X 时间线的信息密度 */
function formatRelativeTime(value: string): string {
  const date = parseDate(value);
  if (!date) return value;

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const diff = Math.abs(Date.now() - date.getTime());

  if (diff < minute) return "刚刚";
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < day * 7) return `${Math.floor(diff / day)}天前`;

  const now = new Date();
  const dateLabel = `${date.getMonth() + 1}月${date.getDate()}日`;
  return date.getFullYear() === now.getFullYear()
    ? dateLabel
    : `${date.getFullYear()}年${dateLabel}`;
}

/** 供时间线排序使用的时间戳 */
export function talkTimestamp(value: string): number {
  return parseDate(value)?.getTime() ?? 0;
}

function formatCount(count: number): string {
  if (count >= 10_000) return `${(count / 10_000).toFixed(1).replace(/\.0$/, "")}万`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(count);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 旧浏览器 / 非安全上下文降级
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      textarea.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function TalkMedia({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (index: number) => void;
}) {
  const visible = images.slice(0, 4);
  const extra = images.length - visible.length;

  if (images.length === 1) {
    return (
      <button
        type="button"
        onClick={() => onOpen(0)}
        aria-label="查看图片"
        className="group relative mt-3 block w-full overflow-hidden rounded-2xl bg-blog-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blog-ink/30"
      >
        <div className="relative aspect-[16/10]">
          <Image
            src={images[0]}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.015]"
          />
        </div>
      </button>
    );
  }

  // 2 张：左右各一；3 张：左侧大图 + 右侧两张；4 张及以上：2×2
  const gridClass =
    images.length === 2
      ? "grid-cols-2 aspect-[2/1]"
      : images.length === 3
        ? "grid-cols-2 grid-rows-2 aspect-[3/2]"
        : "grid-cols-2 aspect-square";

  return (
    <div
      className={cn(
        "mt-3 grid gap-0.5 overflow-hidden rounded-2xl bg-blog-line",
        gridClass,
      )}
    >
      {visible.map((image, index) => (
        <button
          key={`${image}-${index}`}
          type="button"
          onClick={() => onOpen(index)}
          aria-label={`查看第 ${index + 1} 张图片`}
          className={cn(
            "group relative overflow-hidden bg-blog-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blog-ink/30 focus-visible:ring-inset",
            images.length === 3 && index === 0 && "row-span-2",
          )}
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 320px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {extra > 0 && index === visible.length - 1 && (
            <span className="absolute inset-0 grid place-items-center bg-black/50 text-[20px] font-semibold text-white">
              +{extra}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function TalkItem({ talk, onOpenMedia }: TalkItemProps) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const images = talk.imgList ?? [];
  const displayName = talk.nickname?.trim() || "博主";
  const handle = `@${displayName.replace(/\s+/g, "").toLowerCase()}`;
  const likeCount = talk.likeCount ?? 0;
  const fullDate = formatFullDate(talk.createTime);
  const relativeTime = formatRelativeTime(talk.createTime);
  const parsedDate = parseDate(talk.createTime);

  const shareUrl = () => `${window.location.origin}/talks#talk-${talk.id}`;

  const handleCopy = async () => {
    const ok = await copyText(shareUrl());
    if (!ok) {
      toast.error("复制失败，请手动复制地址栏链接");
      return;
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = async () => {
    const url = shareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "说说",
          text: talk.content.slice(0, 80),
          url,
        });
        return;
      } catch (error) {
        // 用户取消系统分享时不做降级
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await handleCopy();
  };

  return (
    <article
      id={`talk-${talk.id}`}
      className="scroll-mt-28 border-b border-blog-line/80 py-4 transition-colors hover:bg-blog-muted/30"
    >
      {talk.isTop && (
        <div className="mb-1 flex items-center gap-1.5 pl-[52px] text-[11.5px] font-medium text-blog-soft">
          <PushPin className="h-3.5 w-3.5" weight="fill" />
          置顶
        </div>
      )}

      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          {talk.avatar ? (
            <Image
              src={talk.avatar}
              alt={displayName}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="text-[13px]">
              {displayName.slice(0, 1)}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1 text-[14.5px] leading-5">
            <span className="max-w-[45%] truncate font-semibold text-blog-ink">
              {displayName}
            </span>
            <span className="min-w-0 truncate text-blog-soft">{handle}</span>
            <span className="shrink-0 text-blog-soft">·</span>
            <time
              dateTime={parsedDate?.toISOString()}
              title={fullDate}
              className="shrink-0 text-[13.5px] text-blog-soft"
            >
              {relativeTime}
            </time>
          </div>

          <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-[1.6] text-blog-ink/90">
            {talk.content}
          </p>

          {images.length > 0 && (
            <TalkMedia
              images={images}
              onOpen={(index) => onOpenMedia(images, index)}
            />
          )}

          <div className="mt-3 flex max-w-[340px] items-center justify-between text-blog-soft">
            <span
              className="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums"
              title={`${likeCount} 次点赞`}
              aria-label={`${likeCount} 次点赞`}
            >
              <Heart className="h-[18px] w-[18px]" />
              {likeCount > 0 && <span>{formatCount(likeCount)}</span>}
            </span>

            <button
              type="button"
              onClick={handleShare}
              aria-label="分享"
              title="分享"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-blog-muted hover:text-blog-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blog-ink/30"
            >
              <ShareNetwork className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "已复制链接" : "复制链接"}
              title={copied ? "已复制" : "复制链接"}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-blog-muted hover:text-blog-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blog-ink/30",
                copied && "text-blog-ink",
              )}
            >
              {copied ? (
                <Check className="h-[18px] w-[18px]" />
              ) : (
                <LinkSimple className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>

          <span role="status" aria-live="polite" className="sr-only">
            {copied ? "链接已复制" : ""}
          </span>
        </div>
      </div>
    </article>
  );
}
