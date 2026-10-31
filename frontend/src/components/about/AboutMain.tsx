"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { AboutInfo } from "@/lib/about";

interface AboutMainProps {
  data: AboutInfo;
}

/** 与文章详情页正文一致的 prose 类名（复用同一套 Markdown 排版） */
const PROSE_CLASS = [
  "prose prose-slate max-w-none dark:prose-invert",
  "prose-headings:font-semibold prose-headings:tracking-tight",
  "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg",
  "prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2",
  "prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
  "dark:prose-a:text-blue-400",
  "prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
  "prose-code:text-sm prose-code:font-medium prose-code:text-blue-600",
  "dark:prose-code:bg-blue-950 dark:prose-code:text-blue-300",
  "prose-pre:bg-gray-900 prose-pre:rounded-lg",
  "prose-blockquote:border-l-blue-400 prose-blockquote:bg-blue-50/50",
  "prose-blockquote:py-1 prose-blockquote:not-italic",
  "dark:prose-blockquote:bg-blue-950/50",
  "prose-ul:marker:text-blue-500 prose-ol:marker:text-blue-500",
  "prose-table:border-collapse prose-th:border prose-th:border-gray-200",
  "prose-th:bg-blue-50 prose-th:px-4 prose-th:py-2",
  "dark:prose-th:border-gray-700 dark:prose-th:bg-blue-950/50",
  "prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-2",
  "dark:prose-td:border-gray-700",
  "prose-img:rounded-lg prose-img:shadow-md",
  "prose-hr:border-gray-200",
].join(" ");

/**
 * 关于页右侧主体：
 *   - 自我介绍（bio）用 Markdown 渲染，排版与文章详情页正文一致；
 *   - 下方按需展示 About Me 要点 / 成就 / 技能分类，保持留白，非空才出现。
 */
export function AboutMain({ data }: AboutMainProps) {
  const hasSkills = Boolean(
    data.backendSkills || data.frontendSkills || data.otherSkills,
  );

  return (
    <div className="reveal-up" style={{ animationDelay: "50ms" }}>
      {/* 自我介绍（Markdown） */}
      {data.bio && (
        <div className={PROSE_CLASS}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {data.bio}
          </ReactMarkdown>
        </div>
      )}

      {/* About Me 要点 */}
      {data.aboutPoints.length > 0 && (
        <section className="mt-10">
          <h2 className="side-title">About Me</h2>
          <ul className="mt-4 space-y-3">
            {data.aboutPoints.map((p, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/80"
              >
                <span className="mt-0.5 shrink-0">{p.emoji || "•"}</span>
                <span className="whitespace-pre-line">{p.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 成就徽章 */}
      {data.achievements.length > 0 && (
        <section className="mt-10">
          <h2 className="side-title">Achievements</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.achievements.map((a, idx) => (
              <span
                key={`${a.name}-${idx}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1 text-sm text-foreground/80"
              >
                <span aria-hidden>{a.icon || "🏆"}</span>
                {a.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 技能分类 */}
      {hasSkills && (
        <section className="mt-10">
          <h2 className="side-title">Skills</h2>
          <div className="mt-4 space-y-4">
            {data.backendSkills && (
              <SkillGroup label="Backend" text={data.backendSkills} />
            )}
            {data.frontendSkills && (
              <SkillGroup label="Frontend" text={data.frontendSkills} />
            )}
            {data.otherSkills && (
              <SkillGroup label="Other" text={data.otherSkills} />
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function SkillGroup({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
        {text}
      </div>
    </div>
  );
}
