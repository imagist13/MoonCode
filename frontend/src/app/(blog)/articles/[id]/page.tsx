"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ArticleNav } from "@/components/blog/ArticleNav";
import { api } from "@/lib/api";
import "highlight.js/styles/github-dark.css";

interface TagBrief {
  id: number;
  tagName: string;
}

interface ArticleDetail {
  id: number;
  articleCover: string;
  articleTitle: string;
  articleContent: string;
  categoryName: string;
  createTime: string;
  updateTime: string;
  tagVOList: TagBrief[];
}

interface NavItem {
  id: number;
  articleTitle: string;
}

/** 从 Markdown 文本中提取 h2/h3 标题，生成 TOC */
function extractHeadings(markdown: string) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "");
    headings.push({ level: match[1].length, text, id });
  }

  return headings;
}

// 错误分类：
//   notFound — 业务侧明确告知资源不存在（后端 code=40004 或 data 为空）
//   server   — 业务返回失败（flag=false 且非 404）
//   network  — fetch 抛异常（超时、断网、CORS 等）
type ErrorKind = "notFound" | "server" | "network";

// 与后端 handler/response.go 保持一致
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

  const loadArticle = () => {
    if (!id) return;
    setLoading(true);
    setErrorKind(null);
    setErrorMessage("");

    api
      .get<ArticleDetail>(`/articles/${id}`)
      .then(async (res) => {
        if (res.flag && res.data) {
          setArticle(res.data);
          // 从首页列表里找出当前文章的上一篇 /下一篇
          try {
            const list = await api.get<
              { records: NavItem[]; count: number } | null
            >(`/articles?current=1&size=200`);
            const records = list.data?.records ?? [];
            const idx = records.findIndex((r) => String(r.id) === String(id));
            if (idx > 0) setPrev(records[idx - 1]);
            if (idx >= 0 && idx < records.length - 1) {
              setNext(records[idx + 1]);
            }
          } catch {
            /* 上下篇是增强体验，失败不影响主流程 */
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
  };

  useEffect(() => {
    loadArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reloadTick]);

  const headings = useMemo(
    () => (article ? extractHeadings(article.articleContent) : []),
    [article],
  );

  if (loading) {
    return (
      <>
        <ReadingProgress />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-96 w-full" />
        </div>
      </>
    );
  }

  if (errorKind === "notFound") {
    return (
      <p className="py-20 text-center text-muted-foreground">
        文章不存在或已被删除
      </p>
    );
  }

  if (errorKind === "server") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <p>服务器错误，请稍后重试{errorMessage ? `（${errorMessage}）` : ""}</p>
        <button
          onClick={() => setReloadTick((t) => t + 1)}
          className="rounded border px-3 py-1 text-sm hover:bg-muted"
        >
          重新加载
        </button>
      </div>
    );
  }

  if (errorKind === "network") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <p>网络连接失败{errorMessage ? `（${errorMessage}）` : ""}</p>
        <button
          onClick={() => setReloadTick((t) => t + 1)}
          className="rounded border px-3 py-1 text-sm hover:bg-muted"
        >
          重试
        </button>
      </div>
    );
  }

  if (!article) {
    return (
      <p className="py-20 text-center text-muted-foreground">
        文章不存在或已被删除
      </p>
    );
  }

  return (
    <>
      <ReadingProgress />
      <div className="flex gap-8">
        {/* 正文区域 */}
        <article className="min-w-0 flex-1">
          {/* 分类面包屑 */}
          {article.categoryName && (
            <Link
              href={`/?categoryId=${article.tagVOList?.[0]?.id ?? ""}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium
                         text-brand-600 transition-colors hover:text-brand-700
                         dark:text-brand-400 dark:hover:text-brand-300"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
              {article.categoryName}
            </Link>
          )}

          {/* 标题 */}
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {article.articleTitle}
          </h1>

          {/* 元信息 */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <time className="inline-flex items-center gap-1.5">
              <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/60" />
              {article.createTime}
            </time>
            {article.tagVOList?.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs transition-colors hover:border-brand-300 hover:text-brand-600
                           dark:hover:border-brand-700 dark:hover:text-brand-400"
              >
                {tag.tagName}
              </Badge>
            ))}
          </div>

          {/* 封面 */}
          {article.articleCover && (
            <div className="mt-6 overflow-hidden rounded-xl shadow-(--shadow-card)">
              <Image
                src={article.articleCover}
                alt={article.articleTitle}
                className="w-full object-cover"
                width={800}
                height={400}
                priority
              />
            </div>
          )}

          {/* Markdown 内容 */}
          <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none
                          prose-headings:scroll-mt-24 prose-headings:font-semibold
                          prose-h2:border-b prose-h2:border-border/60 prose-h2:pb-2
                          prose-h2:text-2xl prose-h3:text-xl
                          prose-blockquote:border-brand-400 prose-blockquote:bg-brand-50/50
                          prose-blockquote:not-italic
                          dark:prose-blockquote:bg-brand-900/20
                          prose-code:before:hidden prose-code:after:hidden
                          prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5
                          prose-code:font-normal prose-code:text-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h2: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
                    .replace(/^-|-$/g, "");
                  return (
                    <h2 id={id} {...props}>
                      {children}
                    </h2>
                  );
                },
                h3: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text
                    .toLowerCase()
                    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
                    .replace(/^-|-$/g, "");
                  return (
                    <h3 id={id} {...props}>
                      {children}
                    </h3>
                  );
                },
              }}
            >
              {article.articleContent}
            </ReactMarkdown>
          </div>

          {/* 上一篇 / 下一篇 */}
          <ArticleNav prev={prev} next={next} />
        </article>

        {/* 侧边 TOC 目录 */}
        <TableOfContents headings={headings} />
      </div>
    </>
  );
}
