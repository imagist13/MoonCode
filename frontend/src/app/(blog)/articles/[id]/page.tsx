"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  Calendar,
  Eye,
  ChevronUp,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { CommentSection, type CommentNode } from "@/components/blog/CommentSection";
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

/** 骨架屏随机宽度（静态生成，避免在渲染时调用 Math.random()） */
const SKELETON_WIDTHS = Array.from(
  { length: 8 },
  () => `${60 + Math.random() * 30}%`,
);

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
  const [showBackTop, setShowBackTop] = useState(false);
  const [password, setPassword] = useState("");
  const [comments] = useState<CommentNode[]>([]);

  useEffect(() => {
    if (!id) return;
    // 使用 flushSync 批量同步更新初始状态，避免多次渲染
    flushSync(() => {
      setLoading(true);
      setErrorKind(null);
    });
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

  // 回到顶部按钮
  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headings = useMemo(
    () => (article ? extractHeadings(article.articleContent) : []),
    [article],
  );

  const handleSubmitComment = async (_content: string) => {
    toast.info("评论功能开发中");
  };

  const handleReply = async (_id: number, _content: string) => {
    toast.info("评论功能开发中");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton-shimmer h-72 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="skeleton-shimmer h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="skeleton-shimmer h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-shimmer h-4 rounded bg-gray-200 dark:bg-gray-700"
              style={{ width: SKELETON_WIDTHS[i] }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (errorKind === "notFound") {
    return (
      <div className="py-20 text-center text-gray-500">
        文章不存在或已被删除
      </div>
    );
  }

  if (errorKind === "server" || errorKind === "network") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
        <p>
          {errorKind === "server" ? "服务器错误" : "网络连接失败"}
          {errorMessage ? `（${errorMessage}）` : ""}
        </p>
        <button
          type="button"
          onClick={() => setReloadTick((t) => t + 1)}
          className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          重试
        </button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-20 text-center text-gray-500">
        文章不存在或已被删除
      </div>
    );
  }

  // 密码保护（spec §4.6）
  if (article.isPassword) {
    return (
      <div className="mx-auto mt-10 max-w-md rounded border border-gray-200 bg-white px-8 pb-8 pt-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          <Lock className="h-5 w-5" /> 受密码保护
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          这篇文章需要输入密码后才能查看
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码"
          className="mb-4 w-full appearance-none rounded border border-gray-300 px-3 py-2 text-gray-700 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          type="button"
          className="w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
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
        <div className="full-bleed relative h-72 w-full overflow-hidden bg-gray-900 md:h-[420px]">
          <Image
            src={article.articleCover}
            alt={article.articleTitle}
            fill
            sizes="100vw"
            preload
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/75" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-10 md:px-8 md:pb-14">
            <div className="mx-auto max-w-[1240px]">
              {article.categoryName && (
                <Link
                  href={`/?category=${article.categoryId ?? ""}`}
                  className="mb-3 inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur-sm transition-colors hover:bg-blue-500/30"
                >
                  {article.categoryName}
                </Link>
              )}
              <h1 className="text-3xl font-bold text-white drop-shadow-md md:text-5xl">
                {article.articleTitle}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-200">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
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

      {/* 双栏布局：左侧 TOC + 右侧正文 */}
      <div className="mx-auto max-w-[1240px] gap-10 px-4 py-10 lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* 左侧 TOC */}
        <TableOfContents headings={headings} />

        {/* 右侧内容 */}
        <article className="min-w-0">
          {/* 没有封面时显示标题区 */}
          {!article.articleCover && (
            <header className="mb-8">
              {article.categoryName && (
                <Link
                  href={`/?category=${article.categoryId ?? ""}`}
                  className="mb-3 inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-500/30 dark:text-blue-300"
                >
                  {article.categoryName}
                </Link>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-gray-100">
                {article.articleTitle}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatTime(article.createTime)}
                </span>
                {article.viewCount !== undefined && (
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
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
                "flex flex-wrap gap-2",
                article.articleCover ? "-mt-2 mb-6" : "mt-5 mb-6",
              )}
            >
              {article.tagVOList.map((t) => (
                <Link
                  key={t.id}
                  href={`/?tag=${t.id}`}
                  className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-500/20 dark:text-blue-300"
                >
                  #{t.tagName}
                </Link>
              ))}
            </div>
          )}

          {/* Markdown 正文 - 增强样式 */}
          <div className="prose prose-slate max-w-none dark:prose-invert
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
            prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            dark:prose-a:text-blue-400
            prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-code:text-sm prose-code:font-medium prose-code:text-blue-600
            dark:prose-code:bg-blue-950 dark:prose-code:text-blue-300
            prose-pre:bg-gray-900 prose-pre:rounded-lg
            prose-blockquote:border-l-blue-400 prose-blockquote:bg-blue-50/50
            prose-blockquote:py-1 prose-blockquote:not-italic
            dark:prose-blockquote:bg-blue-950/50
            prose-ul:marker:text-blue-500 prose-ol:marker:text-blue-500
            prose-table:border-collapse prose-th:border prose-th:border-gray-200
            prose-th:bg-blue-50 prose-th:px-4 prose-th:py-2
            dark:prose-th:border-gray-700 dark:prose-th:bg-blue-950/50
            prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-2
            dark:prose-td:border-gray-700
            prose-img:rounded-lg prose-img:shadow-md
            prose-hr:border-gray-200">
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
                  <figure className="my-6">
                    <img src={src} alt={alt} className="rounded-lg shadow-md" {...props} />
                    {alt && <figcaption className="mt-2 text-center text-sm text-gray-500">{alt}</figcaption>}
                  </figure>
                ),
              }}
            >
              {article.articleContent}
            </ReactMarkdown>
          </div>

          {/* 上下篇导航 */}
          <nav className="mt-16 grid gap-4 border-t border-gray-200 pt-8 md:grid-cols-2 dark:border-gray-700">
            {prev ? (
              <Link href={`/articles/${prev.id}`} className="group block">
                <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-700">
                  <div className="mb-2 inline-flex items-center gap-1 text-xs text-gray-500">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    上一篇
                  </div>
                  <div className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {prev.articleTitle}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link href={`/articles/${next.id}`} className="group block md:text-right">
                <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-700">
                  <div className="mb-2 inline-flex items-center gap-1 text-xs text-gray-500">
                    下一篇
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                  <div className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {next.articleTitle}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}
          </nav>

          {/* 评论 */}
          <div className="mt-12">
            <CommentSection
              comments={comments}
              onSubmit={handleSubmitComment}
              onReply={handleReply}
              onLike={async () => {}}
            />
          </div>
        </article>
      </div>

      {/* 回到顶部 */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="回到顶部"
        className={cn(
          "fixed bottom-8 right-8 z-50 rounded-full bg-white p-3 text-gray-700 shadow-lg ring-1 ring-gray-200 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-blue-950 dark:hover:text-blue-400",
          showBackTop ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  );
}
