"use client";

import React, {
  Children,
  isValidElement,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import ReactMarkdown, { type Components, type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";
import { cn, headingIdMap, slugifyHeading } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  /** 追加到 .prose 容器上的类名 */
  className?: string;
}

type AnchorProps = React.ComponentPropsWithoutRef<"a"> & ExtraProps;
type ImageProps = React.ComponentPropsWithoutRef<"img"> & ExtraProps;
type InputProps = React.ComponentPropsWithoutRef<"input"> & ExtraProps;
/** mdast/hast 节点里我们只关心源码起始行 */
type HeadingNode = { position?: { start?: { line?: number } } };

/** 插件数组放在模块级，避免每次渲染都重新解析 */
const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeHighlight];

/**
 * 统一的 Markdown 渲染器。
 *
 * 文章详情、关于页、后台编辑器预览共用同一套解析与排版规则，
 * 保证「预览所见」=「发布后所得」：
 *   - GFM：表格、任务列表、删除线、自动链接；
 *   - 标题生成与目录一致的锚点 id（重复标题自动去重）；
 *   - 站内链接走 Next 路由，站外链接新窗口打开；
 *   - 独立图片段落渲染为 <figure>，不再产生 <p><figure> 非法嵌套；
 *   - 表格横向滚动容器；代码块高亮 + 复制按钮；
 *   - 不把 react-markdown 的 node 对象透传到 DOM。
 */
export const MarkdownContent = memo(function MarkdownContent({
  content,
  className,
}: MarkdownContentProps) {
  // 预先按源码行号算好标题 id：纯函数、可重复执行，
  // React StrictMode 的重复渲染不会产生 -1/-2 漂移，目录也能对上。
  const headingIds = useMemo(() => headingIdMap(content), [content]);

  const resolveHeadingId = (
    node: HeadingNode | undefined,
    children: ReactNode,
  ) => {
    const line = node?.position?.start?.line;
    const byLine = line === undefined ? undefined : headingIds.get(line);
    return byLine ?? slugifyHeading(childrenToText(children));
  };

  const components: Components = {
    h1: ({ children, node }) => (
      <MarkdownHeading level={1} id={resolveHeadingId(node, children)}>
        {children}
      </MarkdownHeading>
    ),
    h2: ({ children, node }) => (
      <MarkdownHeading level={2} id={resolveHeadingId(node, children)}>
        {children}
      </MarkdownHeading>
    ),
    h3: ({ children, node }) => (
      <MarkdownHeading level={3} id={resolveHeadingId(node, children)}>
        {children}
      </MarkdownHeading>
    ),
    h4: ({ children, node }) => (
      <MarkdownHeading level={4} id={resolveHeadingId(node, children)}>
        {children}
      </MarkdownHeading>
    ),
    a: MarkdownAnchor,
    p: MarkdownParagraph,
    img: MarkdownImage,
    pre: MarkdownPre,
    table: MarkdownTable,
    input: MarkdownInput,
  };

  return (
    <div className={cn("prose max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

/* ==============================
 * 局部组件
 * ============================== */

function MarkdownHeading({
  level,
  id,
  children,
}: {
  level: 1 | 2 | 3 | 4;
  id: string;
  children?: ReactNode;
}) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
  return (
    <Tag id={id} className="scroll-mt-24">
      {children}
    </Tag>
  );
}

function MarkdownAnchor({ href, title, children }: AnchorProps) {
  const url = (href ?? "").trim();
  // 空链接 / 被 URL 安全策略过滤掉的危险协议：降级为纯文本
  if (!url) return <span>{children}</span>;

  // 站外链接：新窗口打开；mailto/tel 与页内锚点保持原行为
  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(url)) {
    return (
      <a href={url} title={title} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (/^(?:mailto|tel):/i.test(url) || url.startsWith("#")) {
    return (
      <a href={url} title={title}>
        {children}
      </a>
    );
  }
  // 站内绝对路径走客户端路由，避免整页刷新
  if (url.startsWith("/")) {
    return (
      <Link href={url} title={title}>
        {children}
      </Link>
    );
  }
  return (
    <a href={url} title={title}>
      {children}
    </a>
  );
}

/**
 * 段落：如果整段只有一张图片（可被链接包裹），提升为 figure + figcaption，
 * 避免 <figure> 嵌套在 <p> 里导致浏览器重排与水合不一致。
 */
function MarkdownParagraph({ children }: { children?: ReactNode }) {
  const items = Children.toArray(children).filter(isMeaningfulNode);
  const only = items.length === 1 ? items[0] : null;
  const image = only ? findImageIn(only) : null;

  if (only && image) {
    return (
      <figure className="prose-figure">
        {only}
        {image.alt ? <figcaption>{image.alt}</figcaption> : null}
      </figure>
    );
  }
  return <p>{children}</p>;
}

function MarkdownImage({ src, alt, title }: ImageProps) {
  return (
    // 正文图片来自任意外链，尺寸未知，无法用 next/image 的固定宽高
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      title={title}
      loading="lazy"
      decoding="async"
      className="prose-img"
    />
  );
}

function MarkdownTable({ children }: { children?: ReactNode }) {
  return (
    <div className="prose-table-wrap" tabIndex={0}>
      <table>{children}</table>
    </div>
  );
}

function MarkdownInput({ type, checked, disabled }: InputProps) {
  if (type === "checkbox") {
    return (
      <input
        type="checkbox"
        className="task-list-checkbox"
        checked={Boolean(checked)}
        disabled={disabled ?? true}
        readOnly
        aria-label={checked ? "已完成" : "未完成"}
      />
    );
  }
  return <input type={type} checked={checked} disabled={disabled} readOnly />;
}

function MarkdownPre({ children }: { children?: ReactNode }) {
  const text = childrenToText(children).replace(/\n$/, "");
  const language = findCodeLanguage(children);

  return (
    <div className="prose-pre">
      {language ? (
        <span className="prose-code-lang" aria-hidden>
          {language}
        </span>
      ) : null}
      <pre>{children}</pre>
      <CopyCodeButton text={text} />
    </div>
  );
}

function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // 非安全上下文等情况下复制可能失败，静默降级
    }
  };

  return (
    <button
      type="button"
      className="prose-copy-btn"
      onClick={handleCopy}
      aria-label={copied ? "已复制" : "复制代码"}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      <span>{copied ? "已复制" : "复制"}</span>
    </button>
  );
}

/* ==============================
 * 工具函数
 * ============================== */

/** 把 React 子节点拍平成纯文本（用于标题 id、代码复制） */
function childrenToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(childrenToText).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    if (node.type === "br") return " ";
    return childrenToText(node.props.children);
  }
  return "";
}

function isMeaningfulNode(node: ReactNode): boolean {
  return !(typeof node === "string" && node.trim() === "");
}

/** 识别「图片」或「链接包裹的图片」，返回 alt 供 figcaption 使用 */
function findImageIn(node: ReactNode): { alt?: string } | null {
  if (!isValidElement(node)) return null;

  if (node.type === MarkdownImage) {
    return { alt: (node.props as { alt?: string }).alt };
  }
  if (node.type === MarkdownAnchor) {
    const inner = Children.toArray(
      (node.props as { children?: ReactNode }).children,
    ).filter(isMeaningfulNode);
    if (inner.length === 1) return findImageIn(inner[0]);
  }
  return null;
}

function findCodeLanguage(children: ReactNode): string | null {
  const first = Children.toArray(children)[0];
  if (!isValidElement<{ className?: string }>(first)) return null;
  const match = /(?:^|\s)language-([\w+#.-]+)/.exec(first.props.className ?? "");
  return match ? match[1] : null;
}

function fallbackCopy(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(area);
  if (!ok) throw new Error("copy failed");
}
