/**
 * 工具函数集合
 */

/** 合并 className，支持 tailwind-merge 处理冲突 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 解析后端时间。
 *
 * Go 的 time.Time 默认序列化为 RFC3339（如 2026-11-25T23:40:22.961521+08:00），
 * 这类字符串必须原样交给 Date —— 任何改写（例如把所有 - 换成 /）都会让它解析失败。
 * 只有原生解析不了时才做兜底：把斜杠换回短横线、空格换成 T，
 * 兼容 "YYYY-MM-DD HH:mm:ss"（部分浏览器不认空格分隔的写法）。
 */
export function parseDateTime(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const text = value.trim();
  if (!text) return null;

  const native = new Date(text);
  if (!Number.isNaN(native.getTime())) return native;

  const fallback = new Date(text.replace(/\//g, "-").replace(" ", "T"));
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/** 格式化时间戳为「几分钟前」等相对时间 */
export function formatTime(date: string | Date): string {
  const d = parseDateTime(date);
  if (!d) return typeof date === "string" ? date : "";
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "刚刚";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} 天前`;
  return d.toLocaleDateString("zh-CN");
}

/** 简化浏览量显示（1234 -> 1.2k） */
export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/** 安全截断字符串 */
export function safeTruncate(s: string, max: number): string {
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/** 去掉行内 markdown 标记，保留可读文本（标题、目录、摘要共用） */
export function stripInlineMarkdown(text: string): string {
  return (text || "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/!\[([^\]]*)\]\[[^\]]*\]/g, "$1")
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, "$1")
    .replace(/`+([^`]*)`+/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\\([\\`*_{}\[\]()#+\-.!])/g, "$1")
    .trim();
}

/** 移除 markdown 标记得到纯文本摘要 */
export function stripMarkdown(s: string): string {
  return (s || "")
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "") // front matter
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, "") // 任务列表
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*\|?[\s:|-]{3,}\|?\s*$/gm, " ") // 表格分隔行
    .replace(/\|/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/!\[([^\]]*)\]\[[^\]]*\]/g, "$1")
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, "$1")
    .replace(/`+([^`]*)`+/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 延迟函数 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** 驼峰转短横线 */
export function kebabCase(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * 标题文本 → 锚点 id。
 * 渲染正文标题与生成目录共用同一套规则，保证点击目录能准确跳转。
 */
export function slugifyHeading(text: string): string {
  const slug = (text || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]+/gu, " ")
    .replace(/[\s]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
  return slug || "section";
}

export interface MarkdownHeading {
  level: number;
  text: string;
  id: string;
  /** 1-based 源码行号，用于和渲染出的标题节点对齐 */
  line: number;
}

/**
 * 扫描 markdown 中的 h1~h4 标题，一次性算出标题文本、行号与唯一锚点 id。
 * - 跳过围栏代码块里的伪标题；
 * - 行内代码/加粗/链接按纯文本计算；
 * - 重复标题追加 -1、-2 后缀（h1~h4 统一参与计数）。
 *
 * 渲染正文标题与生成目录都读取同一份结果，避免两套规则算出不同 id。
 */
export function scanHeadings(markdown: string): MarkdownHeading[] {
  const lines = (markdown || "").split(/\r?\n/);
  const headingRegex = /^(#{1,4})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/;
  const seen = new Map<string, number>();
  const headings: MarkdownHeading[] = [];
  let inFence = false;

  lines.forEach((line, idx) => {
    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    const match = headingRegex.exec(line);
    if (!match) return;

    const text = stripInlineMarkdown(match[2]);
    const base = slugifyHeading(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({
      level: match[1].length,
      text,
      id: count === 0 ? base : `${base}-${count}`,
      line: idx + 1,
    });
  });

  return headings;
}

/** 提取文章 markdown 中的 h2/h3 标题（目录用） */
export function extractHeadings(
  markdown: string,
): { level: number; text: string; id: string }[] {
  return scanHeadings(markdown)
    .filter((h) => h.level === 2 || h.level === 3)
    .map(({ level, text, id }) => ({ level, text, id }));
}

/** 源码行号 → 标题 id，供 Markdown 渲染器按节点位置取用 */
export function headingIdMap(markdown: string): Map<number, string> {
  return new Map(scanHeadings(markdown).map((h) => [h.line, h.id]));
}

/**
 * 从导入的 Markdown 推断文章标题：取第一个标题（h1~h4），
 * 没有标题时回退到文件名。扫描复用 scanHeadings，会跳过代码块里的伪标题。
 */
export function titleFromMarkdown(markdown: string, fallback = ""): string {
  const first = scanHeadings(markdown)[0]?.text.trim();
  return first || fallback.trim();
}