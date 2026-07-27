import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

/**
 * 通用 Markdown 渲染器：
 * - remark-gfm：GFM 表格、任务列表
 * - rehype-slug：标题 id
 * - rehype-highlight：代码高亮
 */
export function MarkdownRenderer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        "prose-headings:font-serif prose-headings:tracking-tight",
        "prose-h1:italic prose-h1:font-normal",
        "prose-h2:italic prose-h2:font-normal",
        "prose-p:leading-relaxed prose-p:text-foreground/90",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-code:font-mono prose-code:text-sm prose-code:bg-muted prose-code:px-1 prose-code:rounded",
        "prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/60",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
