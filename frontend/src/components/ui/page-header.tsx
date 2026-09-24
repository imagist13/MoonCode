import { cn } from "@/lib/utils";

/**
 * 简洁的页面头部（克制风格，避免渐变文字/模糊光斑等 AI 味装饰）
 * - 实色标题
 * - 底部细分隔线作为视觉锚点
 * - 副标题用 muted 灰色
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
    <header className={cn("mb-10 border-b border-gray-200 pb-6 dark:border-gray-700", className)}>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-gray-100">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </header>
  );
}