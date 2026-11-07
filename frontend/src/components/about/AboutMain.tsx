"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { AboutInfo } from "@/lib/about";

interface AboutMainProps {
  data: AboutInfo;
}

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
      {/* 自我介绍（Markdown），复用文章页 .blog-theme .prose 排版 */}
      {data.bio && (
        <div className="prose max-w-none">
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
        <section className="mt-12">
          <SectionTitle>About Me</SectionTitle>
          <ul className="mt-4 space-y-3">
            {data.aboutPoints.map((p, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-blog-soft"
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
        <section className="mt-12">
          <SectionTitle>Achievements</SectionTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.achievements.map((a, idx) => (
              <span
                key={`${a.name}-${idx}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-blog-line px-3 py-1 text-[12.5px] text-blog-soft"
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
        <section className="mt-12">
          <SectionTitle>Skills</SectionTitle>
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

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[10.5px] font-medium tracking-[0.18em] text-blog-soft uppercase">
      {children}
    </h2>
  );
}

function SkillGroup({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-medium tracking-[0.18em] text-blog-soft/70 uppercase">
        {label}
      </div>
      <div className="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-blog-soft">
        {text}
      </div>
    </div>
  );
}
