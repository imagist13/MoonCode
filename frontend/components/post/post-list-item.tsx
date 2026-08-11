import Link from "next/link";
import { PostMeta } from "./post-meta";
import type { ArticleSummary } from "@/types/article";

// 紧凑列表卡片（用于侧栏、归档页）
export function PostListItem({ article }: { article: ArticleSummary }) {
  return (
    <li className="group flex items-start gap-4 py-3">
      <Link
        href={`/articles/${article.slug}` as never}
        className="flex-1 truncate"
      >
        <h3 className="truncate text-sm font-medium text-foreground/90 transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        <div className="mt-1.5">
          <PostMeta article={article} />
        </div>
      </Link>
    </li>
  );
}