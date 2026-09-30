"use client";

import type { AboutInfo } from "@/lib/about";
import { BannerUploader } from "./BannerUploader";

interface AboutMainProps {
  data: AboutInfo;
  editable: boolean;
  bannerValue: string;
  onBannerChange?: (url: string) => void;
}

/**
 * 关于页右侧主体：
 *   - 顶部 banner（可由管理员更换）
 *   - 主标题 "Hi, I'm [昵称]" + 副标题
 *   - "About Me" 项目列表（emoji + 文本）
 *   - "Tech Stack" 技术栈图标网格
 *   - 后端 / 前端 / 其他技能（若有）
 */
export function AboutMain({
  data,
  editable,
  bannerValue,
  onBannerChange,
}: AboutMainProps) {
  const hasBanner = Boolean(bannerValue);

  return (
    <div className="flex flex-col gap-6">
      {hasBanner && (
        <BannerUploader
          value={bannerValue}
          onChange={(url) => onBannerChange?.(url)}
          editable={editable}
        />
      )}

      {/* Greeting 区块 */}
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          🎉 Hi, I&apos;m {data.nickname || "未命名"}
        </p>
        {data.subtitle && (
          <p className="mt-1 text-sm font-medium text-rose-500 dark:text-rose-400">
            {data.subtitle}
          </p>
        )}
      </div>

      {data.aboutPoints.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50">
            <span aria-hidden>🌱</span>
            About Me
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {data.aboutPoints.map((p, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">{p.emoji || "•"}</span>
                <span className="whitespace-pre-line">{p.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.techStack.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50">
            <span aria-hidden>🛠</span>
            Tech Stack
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.techStack.map((t, idx) => (
              <span
                key={`${t.name}-${idx}`}
                title={t.name}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-base font-bold text-white shadow-sm ring-1 ring-black/5"
                style={{ backgroundColor: t.color || "#64748b" }}
              >
                {t.icon || t.name?.[0]?.toUpperCase() || "?"}
              </span>
            ))}
          </div>
        </section>
      )}

      {(data.backendSkills || data.frontendSkills || data.otherSkills) && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50">
            <span aria-hidden>💻</span>
            Skills
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {data.backendSkills && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Backend
                </div>
                <div className="mt-1 whitespace-pre-line">
                  {data.backendSkills}
                </div>
              </div>
            )}
            {data.frontendSkills && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Frontend
                </div>
                <div className="mt-1 whitespace-pre-line">
                  {data.frontendSkills}
                </div>
              </div>
            )}
            {data.otherSkills && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Other
                </div>
                <div className="mt-1 whitespace-pre-line">{data.otherSkills}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {data.bio && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50">
            <span aria-hidden>📝</span>
            Bio
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {data.bio}
          </p>
        </section>
      )}
    </div>
  );
}