"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { EnvelopeSimple, Globe, PencilSimple } from "@phosphor-icons/react";
import type { AboutInfo } from "@/lib/about";
import { AvatarUploader } from "./AvatarUploader";
import { cn } from "@/lib/utils";

interface AboutSidebarProps {
  data: AboutInfo;
  editable: boolean;
  /** 头像上传后回调（仅在 editable 时有效） */
  onAvatarChange?: (url: string) => void;
  /** 头像 URL 受控值 */
  avatarValue: string;
  className?: string;
}

/**
 * 关于页左侧栏（极简）：
 *   ① 身份：头像 + 姓名 + pronouns + 小编辑入口
 *   ② 联系方式：邮箱 / 网站 / GitHub 各占一行
 *   ③ Tech Stack：技术图标网格
 *
 * 视觉与博客侧栏一致：无卡片阴影，只用发丝分割线。
 */
export function AboutSidebar({
  data,
  editable,
  onAvatarChange,
  avatarValue,
  className,
}: AboutSidebarProps) {
  const fallback = (data.nickname || "i").slice(0, 1).toLowerCase();

  const links: {
    href: string;
    icon: ComponentType<{ className?: string }>;
    label: string;
    external?: boolean;
  }[] = [];
  if (data.email) {
    links.push({ href: `mailto:${data.email}`, icon: EnvelopeSimple, label: data.email });
  }
  if (data.website) {
    links.push({
      href: data.website,
      icon: Globe,
      label: prettyUrl(data.website),
      external: true,
    });
  }
  if (data.github) {
    links.push({
      href: data.github,
      icon: GithubIcon,
      label: prettyUrl(data.github),
      external: true,
    });
  }

  return (
    <aside className={cn("reveal-up space-y-9", className)}>
      {/* ─── 身份 ─── */}
      <section className="relative text-center">
        {editable && (
          <Link
            href="/admin/settings"
            title="编辑资料"
            className="absolute top-0 right-0 rounded-full p-2 text-blog-soft transition-colors hover:bg-blog-muted hover:text-blog-ink"
          >
            <PencilSimple className="h-3.5 w-3.5" />
          </Link>
        )}

        <div className="flex justify-center">
          {avatarValue ? (
            <AvatarUploader
              value={avatarValue}
              onChange={(url) => onAvatarChange?.(url)}
              editable={editable}
              size={112}
            />
          ) : (
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full bg-blog-muted text-5xl font-semibold text-blog-soft select-none"
              aria-label="avatar placeholder"
            >
              {fallback}
            </div>
          )}
        </div>

        <h1 className="mt-5 text-[26px] leading-tight font-semibold tracking-[-0.02em] text-blog-ink">
          {data.nickname || "未命名"}
        </h1>
        {data.pronouns && (
          <p className="mt-1 text-[12.5px] text-blog-soft">{data.pronouns}</p>
        )}
      </section>

      {/* ─── 联系方式 ─── */}
      {links.length > 0 && (
        <section className="border-t border-blog-line pt-5">
          <SectionTitle>联系方式</SectionTitle>
          <ul className="mt-3 space-y-0.5">
            {links.map((link) => (
              <li key={link.href + link.label}>
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer noopener" : undefined}
                  className="group flex items-center gap-2.5 rounded-lg py-1.5 text-[13px] text-blog-soft transition-colors hover:text-blog-ink"
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blog-muted text-blog-soft transition-colors group-hover:text-blog-ink">
                    <link.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ─── Tech Stack ─── */}
      {data.techStack.length > 0 && (
        <section className="border-t border-blog-line pt-5">
          <div className="flex items-center justify-between">
            <SectionTitle>Tech Stack</SectionTitle>
            <span className="font-mono text-[10.5px] text-blog-soft">
              {data.techStack.length}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {data.techStack.map((t, idx) => (
              <span
                key={`${t.name}-${idx}`}
                title={t.name}
                className="flex aspect-square items-center justify-center rounded-lg border border-blog-line bg-blog-muted/60 text-[13px] text-blog-ink/70"
              >
                {t.icon || t.name?.[0]?.toUpperCase() || "?"}
              </span>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[10.5px] font-medium tracking-[0.18em] text-blog-soft uppercase">
      {children}
    </h3>
  );
}

/** 显示用 URL：去掉协议头与末尾的 /，避免邮箱/链接占两行 */
function prettyUrl(raw: string): string {
  if (!raw) return "";
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** GitHub 图标（lucide 已移除品牌图标，这里用内联 SVG） */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
