"use client";

import Link from "next/link";
import { Pencil, Link2, Mail } from "lucide-react";
import type { AboutInfo } from "@/lib/about";
import { AvatarUploader } from "./AvatarUploader";
import { cn } from "@/lib/utils";

interface AboutSidebarProps {
  data: AboutInfo;
  editable: boolean;
  /** 头像上传后回调（仅在 editable 时有效） */
  onAvatarChange?: (url: string) => void;
  /** 头像 URL 受控值（编辑场景下使用，传入 AvatarUploader） */
  avatarValue: string;
  className?: string;
}

/**
 * 关于页左侧栏：
 *   [大头像]   昵称 · pronouns
 *              一句话 intro
 *              [编辑资料] 按钮（管理员）
 *              followers · following
 *              邮箱 + 网站链接
 *              Achievements 徽章
 */
export function AboutSidebar({
  data,
  editable,
  onAvatarChange,
  avatarValue,
  className,
}: AboutSidebarProps) {
  return (
    <aside className={cn("flex flex-col items-center text-center", className)}>
      <AvatarUploader
        value={avatarValue}
        onChange={(url) => onAvatarChange?.(url)}
        editable={editable}
        size={144}
      />

      <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-slate-50">
        {data.nickname || "未命名"}
      </h1>

      {data.pronouns && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {data.nickname || ""} · {data.pronouns}
        </p>
      )}

      {data.intro && (
        <p className="mt-3 whitespace-pre-line px-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {data.intro}
        </p>
      )}

      {editable && (
        <Link
          href="/admin/settings"
          className="mt-5 inline-flex w-full max-w-[220px] items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Pencil className="h-3.5 w-3.5" />
          编辑资料
        </Link>
      )}

      <div className="mt-5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {data.followers}
          </span>{" "}
          followers
        </span>
        <span>·</span>
        <span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {data.following}
          </span>{" "}
          following
        </span>
      </div>

      {(data.email || data.website || data.github) && (
        <ul className="mt-4 w-full space-y-1.5 text-sm">
          {data.email && (
            <li>
              <a
                href={`mailto:${data.email}`}
                className="inline-flex items-center gap-2 text-slate-700 transition-colors hover:text-rose-500 dark:text-slate-300 dark:hover:text-rose-400"
              >
                <Mail className="h-3.5 w-3.5" />
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
                className="inline-flex items-center gap-2 text-slate-700 transition-colors hover:text-rose-500 dark:text-slate-300 dark:hover:text-rose-400"
              >
                <Link2 className="h-3.5 w-3.5" />
                {prettyUrl(data.website || data.github)}
              </a>
            </li>
          )}
        </ul>
      )}

      {data.achievements.length > 0 && (
        <div className="mt-6 w-full">
          <h3 className="text-left text-sm font-semibold text-slate-800 dark:text-slate-100">
            Achievements
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.achievements.map((a, idx) => (
              <span
                key={`${a.name}-${idx}`}
                title={a.name}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-base shadow-sm ring-1 ring-black/5"
                style={{ backgroundColor: a.color || "#fde68a" }}
              >
                {a.icon || a.name?.[0] || "★"}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

/** 显示用 URL：去掉协议头与末尾的 /，避免邮箱/链接占两行 */
function prettyUrl(raw: string): string {
  if (!raw) return "";
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}