import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-slate max-w-none text-pretty leading-relaxed",
        "prose-headings:scroll-mt-header prose-headings:font-semibold",
        "prose-h1:text-2xl prose-h1:mt-10 prose-h1:mb-4",
        "prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3",
        "prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2",
        "prose-p:my-3",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em]",
        "prose-pre:rounded-lg prose-pre:bg-night-soft prose-pre:text-moon",
        "prose-blockquote:border-l-primary/50 prose-blockquote:bg-muted/40 prose-blockquote:not-italic prose-blockquote:rounded-r-md",
        "prose-img:rounded-lg prose-img:shadow-sm",
        "prose-hr:border-border",
        "prose-table:my-4 prose-th:bg-muted/50",
        "dark:prose-invert",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            { behavior: "wrap", properties: { className: ["no-underline"] } },
          ],
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}