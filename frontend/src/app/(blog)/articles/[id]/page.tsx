"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  CalendarBlank,
  Eye,
  Lock,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { SailingToc } from "@/components/blog/SailingToc";
import { CommentSection, type CommentNode } from "@/components/blog/CommentSection";
import { SoftActionWheel } from "@/components/leibox/soft-action-wheel/SoftActionWheel";
import { api } from "@/lib/api";
import { cn, extractHeadings, formatTime, formatViews } from "@/lib/utils";
import { toast } from "sonner";

interface ArticleDetail {
  id: number;
  articleTitle: string;
  articleContent: string;
  articleCover?: string;
  categoryName?: string;
  categoryId?: number;
  createTime: string;
  updateTime?: string;
  viewCount?: number;
  tagVOList?: { id: number; tagName: string }[];
  isPassword?: boolean;
}

interface NavItem {
  id: number;
  articleTitle: string;
}

type ErrorKind = "notFound" | "server" | "network";

const BACKEND_CODE_NOT_FOUND = 40004;

/** 骨架屏行宽：固定数组，保证 SSR 与客户端首次渲染一致 */
const SKELETON_WIDTHS = [
  "92%",
  "78%",
  "95%",
  "84%",
  "88%",
  "72%",
  "90%",
  "76%",
];

/** 标题转 id */
function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-龥]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [prev, setPrev] = useState<NavItem | null>(null);
  const [next, setNext] = useState<NavItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadTick, setReloadTick] = useState(0);
  const [password, setPassword] = useState("");
  const [comments] = useState<CommentNode[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErrorKind(null);
    api
      .get<ArticleDetail>(`/articles/${id}`)
      .then(async (res) => {
        if (res.flag && res.data) {
          setArticle(res.data);
          // 上下篇
          try {
            const list = await api.get<{ records: NavItem[]; count: number }>(
              "/articles?current=1&size=200",
            );
            const records = list.data?.records ?? [];
            const idx = records.findIndex((r) => String(r.id) === String(id));
            if (idx > 0) setPrev(records[idx - 1]);
            if (idx >= 0 && idx < records.length - 1) setNext(records[idx + 1]);
          } catch {
            /* 上下篇是增强体验 */
          }
          return;
        }
        if (res.code === BACKEND_CODE_NOT_FOUND || !res.data) {
          setErrorKind("notFound");
        } else {
          setErrorKind("server");
          setErrorMessage(res.message || "服务器错误");
        }
      })
      .catch((err) => {
        setErrorKind("network");
        setErrorMessage(err instanceof Error ? err.message : "网络异常");
      })
      .finally(() => setLoading(false));
  }, [id, reloadTick]);

  const headings = useMemo(
    () => (article ? extractHeadings(article.articleContent) : []),
    [article],
  );

  const handleSubmitComment = async () => {
    toast.info("评论功能开发中");
  };

  const handleReply = async () => {
    toast.info("评论功能开发中");
  };

  // 文章页右下角快捷操作：分享 / 评论 / 回顶
  const handleWheelAction = async (action: string) => {
    if (action === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (action === "comment") {
      document.getElementById("comments")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }
    if (action === "share") {
      const url = window.location.href;
      const title = article?.articleTitle ?? document.title;
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title, url });
          return;
        } catch {
          /* 用户取消分享 */
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        toast.success("链接已复制");
      } catch {
        toast.error("复制失败，请手动复制地址栏链接");
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="skeleton-shimmer aspect-[16/7] w-full rounded-2xl bg-blog-muted" />
        <div className="skeleton-shimmer h-8 w-3/4 rounded bg-blog-muted" />
        <div className="skeleton-shimmer h-4 w-1/3 rounded bg-blog-muted" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-shimmer h-4 rounded bg-blog-muted"
              style={{ width: SKELETON_WIDTHS[i] }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (errorKind === "notFound") {
    return (
      <div className="py-24 text-center text-sm text-blog-soft">
        文章不存在或已被删除
      </div>
    );
  }

  if (errorKind === "server" || errorKind === "network") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-sm text-blog-soft">
        <p>
          {errorKind === "server" ? "服务器错误" : "网络连接失败"}
          {errorMessage ? `（${errorMessage}）` : ""}
        </p>
        <button
          type="button"
          onClick={() => setReloadTick((t) => t + 1)}
          className="rounded-full border border-blog-line px-4 py-1.5 text-[13px] text-blog-ink transition-colors hover:bg-blog-muted"
        >
          重试
        </button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-24 text-center text-sm text-blog-soft">
        文章不存在或已被删除
      </div>
    );
  }

  // 密码保护（spec §4.6）
  if (article.isPassword) {
    return (
      <div className="mx-auto mt-10 max-w-md rounded-2xl border border-blog-line bg-blog-surface px-8 pt-7 pb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blog-ink">
          <Lock className="h-5 w-5" /> 受密码保护
        </h2>
        <p className="mb-5 text-sm text-blog-soft">
          这篇文章需要输入密码后才能查看
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码"
          className="mb-4 w-full appearance-none rounded-lg border border-blog-line bg-transparent px-3 py-2.5 text-sm text-blog-ink transition-colors placeholder:text-blog-soft/60 focus:border-blog-ink focus:outline-none"
        />
        <button
          type="button"
          className="w-full rounded-lg bg-blog-ink px-4 py-2.5 text-sm font-medium text-blog-bg transition-opacity hover:opacity-85"
        >
          提交
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 封面（full-bleed 全宽铺满视口） */}
      {article.articleCover && (
        <div className="full-bleed relative -mt-10 h-[58vh] max-h-[560px] min-h-[380px] w-full overflow-hidden bg-[#0b0b0a] md:-mt-14">
          <Image
            src={article.articleCover}
            alt={article.articleTitle}
            fill
            sizes="100vw"
            preload
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/80" />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-12 md:px-8 md:pb-16">
            <div className="mx-auto max-w-[1200px]">
              {article.categoryName && (
                <Link
                  href={`/?category=${article.categoryId ?? ""}`}
                  className="mb-5 inline-block text-[11px] font-medium tracking-[0.22em] text-white/55 uppercase transition-colors hover:text-white"
                >
                  {article.categoryName}
                </Link>
              )}
              <h1 className="max-w-4xl text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.06] font-semibold tracking-[-0.035em] text-white">
                {article.articleTitle}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-5 text-[11px] tracking-[0.08em] text-white/55">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarBlank className="h-3.5 w-3.5" />
                  {formatTime(article.createTime)}
                </span>
                {article.viewCount !== undefined && (
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    {formatViews(article.viewCount)} 阅读
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 双栏布局：左侧 TOC + 右侧正文；宽屏下目录退到正文左侧留白，正文居中 */}
      <div className="relative mx-auto max-w-[1080px] gap-14 py-16 lg:max-[1367px]:grid lg:max-[1367px]:grid-cols-[240px_minmax(0,1fr)]">
        {/* 左侧 TOC：帆船跟随当前章节 */}
        <SailingToc headings={headings} />

        {/* 右侧内容 */}
        <article className="min-w-0 min-[1368px]:mx-auto min-[1368px]:max-w-[720px]">
          {/* 没有封面时显示标题区 */}
          {!article.articleCover && (
            <header className="mb-10">
              {article.categoryName && (
                <Link
                  href={`/?category=${article.categoryId ?? ""}`}
                  className="mb-4 inline-block text-[11px] font-medium tracking-[0.18em] text-blog-soft uppercase transition-colors hover:text-blog-ink"
                >
                  {article.categoryName}
                </Link>
              )}
              <h1 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-blog-ink">
                {article.articleTitle}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-5 text-[12px] text-blog-soft">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarBlank className="h-3.5 w-3.5" />
                  {formatTime(article.createTime)}
                </span>
                {article.viewCount !== undefined && (
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    {formatViews(article.viewCount)} 阅读
                  </span>
                )}
              </div>
            </header>
          )}

          {/* 标签 */}
          {article.tagVOList && article.tagVOList.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-x-4 gap-y-2",
                article.articleCover ? "mb-10" : "mt-4 mb-10",
              )}
            >
              {article.tagVOList.map((t) => (
                <Link
                  key={t.id}
                  href={`/?tag=${t.id}`}
                  className="text-[12.5px] text-blog-soft transition-colors hover:text-blog-ink"
                >
                  #{t.tagName}
                </Link>
              ))}
            </div>
          )}

          {/* Markdown 正文 */}
          <div className="prose max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children, ...props }) => {
                  const text = String(children);
                  const id = headingId(text);
                  return (
                    <h1 id={id} className="scroll-mt-24" {...props}>
                      {children}
                    </h1>
                  );
                },
                h2: ({ children, ...props }) => {
                  const text = String(children);
                  const id = headingId(text);
                  return (
                    <h2 id={id} className="scroll-mt-24" {...props}>
                      {children}
                    </h2>
                  );
                },
                h3: ({ children, ...props }) => {
                  const text = String(children);
                  const id = headingId(text);
                  return (
                    <h3 id={id} className="scroll-mt-24" {...props}>
                      {children}
                    </h3>
                  );
                },
                h4: ({ children, ...props }) => {
                  const text = String(children);
                  const id = headingId(text);
                  return (
                    <h4 id={id} className="scroll-mt-24" {...props}>
                      {children}
                    </h4>
                  );
                },
                a: ({ href, children, ...props }) => {
                  const isExternal = /^https?:\/\//.test(href ?? "");
                  if (isExternal) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                        {children}
                      </a>
                    );
                  }
                  return <a href={href} {...props}>{children}</a>;
                },
                // 增强代码块样式
                pre: ({ children, ...props }) => (
                  <pre className="relative group" {...props}>
                    {children}
                  </pre>
                ),
                // 增强图片样式
                img: ({ src, alt, ...props }) => (
                  <figure className="my-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={alt} className="rounded-xl" {...props} />
                    {alt && <figcaption className="mt-3 text-center text-[12.5px] text-blog-soft">{alt}</figcaption>}
                  </figure>
                ),
              }}
            >
              {article.articleContent}
            </ReactMarkdown>
          </div>

          {/* 上下篇导航 */}
          <nav className="mt-20 grid gap-10 border-t border-blog-line pt-8 md:grid-cols-2">
            {prev ? (
              <Link href={`/articles/${prev.id}`} className="group block">
                <div className="mb-2 inline-flex items-center gap-1.5 text-[10.5px] tracking-[0.16em] text-blog-soft uppercase">
                  <CaretLeft className="h-3 w-3" />
                  上一篇
                </div>
                <div className="line-clamp-2 text-[15px] leading-snug font-medium text-blog-ink transition-opacity group-hover:opacity-60">
                  {prev.articleTitle}
                </div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link href={`/articles/${next.id}`} className="group block md:text-right">
                <div className="mb-2 inline-flex items-center gap-1.5 text-[10.5px] tracking-[0.16em] text-blog-soft uppercase">
                  下一篇
                  <CaretRight className="h-3 w-3" />
                </div>
                <div className="line-clamp-2 text-[15px] leading-snug font-medium text-blog-ink transition-opacity group-hover:opacity-60">
                  {next.articleTitle}
                </div>
              </Link>
            ) : (
              <div />
            )}
          </nav>

          {/* 评论 */}
          <div id="comments" className="mt-12 scroll-mt-24">
            <CommentSection
              comments={comments}
              onSubmit={handleSubmitComment}
              onReply={handleReply}
              onLike={async () => {}}
            />
          </div>
        </article>
      </div>

      {/* 右下角快捷操作：分享 / 评论 / 回顶 */}
      <SoftActionWheel
        className="pointer-events-none fixed right-4 bottom-4 z-50 h-[280px] w-[280px]"
        onAction={handleWheelAction}
      />
    </div>
  );
}
