import { cn } from "@/lib/utils";

/**
 * 简洁的页面头部（克制风格，避免渐变文字/模糊光斑等 AI 味装饰）
 * - 实色标题
 * - 底部细分隔线作为视觉锚点
 * - 副标题用 muted 灰色
 *
 * 仅用于博客前台，颜色走 .blog-theme token。
 */
export function PageHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-10 border-b border-blog-line pb-6", className)}>
      <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.03em] text-blog-ink md:text-[2rem]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-[13px] text-blog-soft">{description}</p>
      )}
    </header>
  );
}
