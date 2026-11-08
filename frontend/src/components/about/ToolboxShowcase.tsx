"use client";

import type { CSSProperties } from "react";
import {
  Code,
  MagnifyingGlass,
  TerminalWindow,
  type Icon,
} from "@phosphor-icons/react";
import { CollectionLayoutMorph } from "@/components/leibox/collection-layout-morph/CollectionLayoutMorph";

const CROP_WIDTH = 520;
const CROP_HEIGHT = 408;
const COLUMN_WIDTH = 340;

interface Tool {
  name: string;
  note: string;
  tag: string;
  icon: Icon;
  tone: string;
  fg: string;
}

const TOOLS: Tool[] = [
  {
    name: "Claude Code",
    note: "结对编程",
    tag: "CLI",
    icon: TerminalWindow,
    tone: "#F2E6DE",
    fg: "#D97757",
  },
  {
    name: "Codex",
    note: "代码审阅",
    tag: "API",
    icon: Code,
    tone: "#EAE9FF",
    fg: "#5B5BD6",
  },
  {
    name: "Grok",
    note: "资料检索",
    tag: "WEB",
    icon: MagnifyingGlass,
    tone: "#E5E5E5",
    fg: "#171717",
  },
];

/**
 * 关于页 · 右栏「我的三件套」。
 * 场景固定 1280×720，裁到面板区域（384–896 × 140–540）后按右栏宽度等比缩放；
 * xl 下独占第三栏并 sticky 跟随中栏滚动，lg 下排在正文下方，窄屏退化为静态列表。
 * 右栏窄于中栏，组件内部字号已按 340/520 的缩放比放大，保证可读性。
 */
export function ToolboxShowcase() {
  return (
    <section className="reveal-up lg:col-start-2 lg:row-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-28 xl:self-start">
      <h2 className="text-[10.5px] font-medium tracking-[0.18em] text-blog-soft uppercase">
        Toolbox
      </h2>
      <p className="mt-3 text-[13.5px] leading-relaxed text-blog-soft">
        每天打开最多的三件工具。切换列表、卡片或叠放，看看它们怎么换位置。
      </p>

      <div
        className="morph-theme mt-4 hidden lg:block"
        style={
          {
            "--clm-bg": "transparent",
            "--clm-ink": "var(--blog-ink)",
            "--clm-soft": "var(--blog-soft)",
            "--clm-muted": "var(--blog-muted)",
            "--clm-line": "var(--blog-line)",
          } as CSSProperties
        }
      >
        <div
          className="relative overflow-hidden"
          style={{
            width: COLUMN_WIDTH,
            height: (COLUMN_WIDTH * CROP_HEIGHT) / CROP_WIDTH,
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              width: CROP_WIDTH,
              height: CROP_HEIGHT,
              transform: `scale(${COLUMN_WIDTH / CROP_WIDTH})`,
              transformOrigin: "top left",
            }}
          >
            <div
              className="absolute"
              style={{ left: -380, top: -136, width: 1280 }}
            >
              <CollectionLayoutMorph className="w-full" />
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-5 divide-y divide-blog-line lg:hidden">
        {TOOLS.map((tool) => (
          <li key={tool.name} className="flex items-center gap-3 py-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: tool.tone, color: tool.fg }}
            >
              <tool.icon className="h-5 w-5" weight="bold" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium text-blog-ink">
                {tool.name}
              </span>
              <span className="mt-0.5 block text-[12px] text-blog-soft">
                {tool.note}
              </span>
            </span>
            <span className="font-mono text-[10px] tracking-[0.08em] text-blog-soft/60">
              {tool.tag}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
