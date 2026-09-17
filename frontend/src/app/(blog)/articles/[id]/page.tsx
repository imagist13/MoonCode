"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Calendar, Eye, ChevronUp, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { CommentSection, type CommentNode } from "@/components/blog/CommentSection";
import { api } from "@/lib/api";
import { cn, extractHeadings, formatViews } from "@/lib/utils";
import { toast } from "sonner";

interface ArticleDetail {
  id: number;
  articleTitle: string;
  articleContent: string;
  articleCover?: string;
  categoryName?: string;
  categoryId?: number;
  createTime: string;
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
  const [comments, setComments] = useState<CommentNode[]>([]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              style={{ width: `${60 + Math.random() * 30}%` }}
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
      {/* 封面（spec §4.6） */}
      {article.articleCover && (
        <div className="relative h-72 w-full overflow-hidden md:h-96">
          <Image
            src={article.articleCover}
            alt={article.articleTitle}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-8 md:px-8">
            <div className="mx-auto max-w-4xl">
              {article.categoryName && (
                <Link
                  href={`/?category=${article.categoryId ?? ""}`}
                  className="mb-3 inline-block rounded bg-blue-500 px-2 py-0.5 text-xs font-medium text-white"
                >
                  {article.categoryName}
                </Link>
              )}
              <h1 className="text-3xl font-bold text-white md:text-5xl">
                {article.articleTitle}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-200">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {article.createTime}
                </span>
                {article.viewCount !== undefined && (
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatViews(article.viewCount)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 三栏布局 */}
      <div
        className={cn(
          "mx-auto grid max-w-[1240px] gap-8 px-4 py-8 lg:grid-cols-[1fr_4fr_1fr]",
          article.articleCover && "-mt-20 relative z-10",
        )}
      >
        {/* 左侧 TOC */}
        <TableOfContents headings={headings} />

        {/* 中间内容 */}
        <article className="min-w-0 rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
          {/* 如果没有封面则在文章卡片内显示标题 */}
          {!article.articleCover && (
            <>
              {article.categoryName && (
                <Link
                  href={`/?category=${article.categoryId ?? ""}`}
                  className="mb-3 inline-block rounded bg-blue-500 px-2 py-0.5 text-xs font-medium text-white"
                >
                  {article.categoryName}
                </Link>
              )}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {article.articleTitle}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {article.createTime}
                </span>
                {article.viewCount !== undefined && (
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatViews(article.viewCount)}
                  </span>
                )}
              </div>
            </>
          )}

          {/* 标签 */}
          {article.tagVOList && article.tagVOList.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tagVOList.map((t) => (
                <Link
                  key={t.id}
                  href={`/?tag=${t.id}`}
                  className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                >
                  #{t.tagName}
                </Link>
              ))}
            </div>
          )}

          {/* Markdown 正文（spec §7.3 prose 适配暗色） */}
          <div className="prose prose-neutral dark:prose-invert mt-6 max-w-none
                          prose-headings:scroll-mt-24 prose-headings:font-semibold
                          prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
                          dark:prose-h2:border-gray-700
                          prose-h2:text-2xl prose-h3:text-xl">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h2: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .replace(/[^\w一-龥]+/g, "-")
                    .replace(/^-|-$/g, "");
                  return <h2 id={id} {...props}>{children}</h2>;
                },
                h3: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .replace(/[^\w一-龥]+/g, "-")
                    .replace(/^-|-$/g, "");
                  return <h3 id={id} {...props}>{children}</h3>;
                },
              }}
            >
              {article.articleContent}
            </ReactMarkdown>
          </div>

          {/* 上下篇（spec §4.6） */}
          <nav className="mt-12 grid gap-4 border-t border-gray-200 pt-8 md:grid-cols-2 dark:border-gray-700">
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
          <CommentSection
            comments={comments}
            onSubmit={handleSubmitComment}
            onReply={handleReply}
            onLike={async () => {}}
          />
        </article>

        {/* 右侧 meta */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                文章信息
              </h4>
              {article.categoryName && (
                <div className="mb-2 text-xs text-gray-500">
                  <span className="text-gray-400">分类：</span>
                  {article.categoryName}
                </div>
              )}
              <div className="text-xs text-gray-500">
                <span className="text-gray-400">发布时间：</span>
                {article.createTime}
              </div>
              {article.viewCount !== undefined && (
                <div className="mt-1 text-xs text-gray-500">
                  <span className="text-gray-400">阅读量：</span>
                  {article.viewCount}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* 回到顶部（spec §4.6） */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="回到顶部"
        className={cn(
          "fixed bottom-8 right-8 z-50 rounded-full bg-white p-3 text-gray-700 shadow-lg transition-all duration-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
          showBackTop ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  );
}