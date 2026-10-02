"use client";

import Link from "next/link";
import { Globe, Pencil, Mail } from "lucide-react";
import type { AboutInfo } from "@/lib/about";
import { AvatarUploader } from "./AvatarUploader";
import { Card, CardContent } from "@/components/ui/card";
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
 * 关于页左侧栏：
 *   ① 身份卡：头像 + 昵称 + pronouns + 一句话 intro + 编辑资料（重叠在 banner 下沿）
 *   ② 联系方式：邮箱 / 网站
 *   ③ Tech Stack：5×n 技术图标网格
 */
export function AboutSidebar({
  data,
  editable,
  onAvatarChange,
  avatarValue,
  className,
}: AboutSidebarProps) {
  // 缺头像时显示首字母占位
  const fallback = (data.nickname || "i").slice(0, 1).toLowerCase();

  return (
    <aside className={cn("space-y-6 reveal-up", className)}>
      {/* ─── 身份卡 ─── */}
      <Card className="card-static pt-0">
        {/* 头像：水平居中，-mt-12 让它从卡顶探出 50% */}
        <div className="flex justify-center -mt-12">
          <div className="relative">
            {avatarValue ? (
              <AvatarUploader
                value={avatarValue}
                onChange={(url) => onAvatarChange?.(url)}
                editable={editable}
                size={112}
                className="avatar-ring"
              />
            ) : (
              <div
                className="avatar-ring avatar-placeholder flex h-28 w-28 items-center justify-center rounded-full text-5xl select-none"
                aria-label="avatar placeholder"
              >
                {fallback}
              </div>
            )}
            <span
              className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card"
              title="在线"
              aria-label="在线"
            />
          </div>
        </div>

        {/* 资料 */}
        <div className="px-5 pt-3 pb-5 text-center">
          <h1 className="text-xl font-bold text-foreground">
            {data.nickname || "未命名"}
          </h1>
          {data.pronouns && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {data.nickname || ""} · {data.pronouns}
            </p>
          )}
          {data.intro && (
            <p className="mt-3 text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
              {data.intro}
            </p>
          )}

          {editable && (
            <Link
              href="/admin/settings"
              className="mt-4 inline-flex w-full max-w-[200px] items-center justify-center gap-1.5 border border-foreground/15 bg-background px-4 py-2 text-sm font-medium text-foreground/80 transition-all hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              style={{ borderRadius: "9999px" }}
            >
              <Pencil className="h-3.5 w-3.5" />
              编辑资料
            </Link>
          )}
        </div>
      </Card>

      {/* ─── 联系方式 ─── */}
      {(data.email || data.website || data.github) && (
        <Card size="sm">
          <CardContent>
            <h3 className="side-title">联系方式</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {data.email && (
                <li>
                  <a
                    href={`mailto:${data.email}`}
                    className="link-brand inline-flex items-center gap-2"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Mail className="h-3 w-3" />
                    </span>
                    {data.email}
                  </a>
                </li>
              )}
              {(data.website || data.github) && (
                <li>
                  <a
                    href={data.website || data.github}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-brand inline-flex items-center gap-2"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-50">
                      <Globe className="h-3 w-3" />
                    </span>
                    {prettyUrl(data.website || data.github)}
                  </a>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ─── Tech Stack ─── */}
      {data.techStack.length > 0 && (
        <Card size="sm">
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="side-title">Tech Stack</h3>
              <span className="font-mono text-xs text-muted-foreground">
                {data.techStack.length}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {data.techStack.map((t, idx) => (
                <span
                  key={`${t.name}-${idx}`}
                  title={t.name}
                  className="tech-icon"
                  style={{ backgroundColor: t.color || "#64748b" }}
                >
                  {t.icon || t.name?.[0]?.toUpperCase() || "?"}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
}

/** 显示用 URL：去掉协议头与末尾的 /，避免邮箱/链接占两行 */
function prettyUrl(raw: string): string {
  if (!raw) return "";
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}