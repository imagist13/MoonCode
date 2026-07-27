"use client";

import { useRouter } from "next/navigation";
import { EditorShell } from "@/components/admin/editor-shell";
import { articles } from "@/lib/api/articles";
import { TOKEN_COOKIE } from "@/lib/constants";
import { useEditorStore } from "@/stores/editor-store";
import { toast } from "@/components/ui/toast";

/**
 * 新建文章页 —— 使用 EditorShell 组件；此处仅串联提交逻辑。
 */
export default function NewArticlePage() {
  const router = useRouter();
  const reset = useEditorStore((s) => s.reset);

  return (
    <div className="space-y-8">
      <header>
        <div className="label-mono text-muted-foreground">Editor</div>
        <h1 className="mt-2 text-3xl tracking-tight">
          <span className="display-serif">Write</span> a new article
        </h1>
      </header>

      <EditorShell
        onSubmit={async (draft) => {
          const token = readToken();
          if (!token) {
            toast({ title: "未登录", variant: "destructive" });
            router.push("/login");
            return;
          }
          const article = await articles.create(
            {
              title: draft.title,
              slug: draft.slug || undefined,
              summary: draft.summary || undefined,
              content: draft.content,
              cover: draft.cover || undefined,
              category_id: draft.categoryId,
              tag_ids: draft.tagIds,
              status: 1,
            },
            token
          );
          reset();
          router.push(`/articles/${article.slug}`);
        }}
      />
    </div>
  );
}

/** 从 document.cookie 读取 token（浏览器端简化实现）。 */
function readToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp("(?:^|; )" + TOKEN_COOKIE + "=([^;]+)")
  );
  return m ? decodeURIComponent(m[1]) : null;
}
