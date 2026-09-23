"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { flushSync } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, EyeOff, Columns2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoSave } from "@/hooks/use-auto-save";

/* ==============================
 * 常量
 * ============================== */

const TOOLBAR_GROUPS = [
  { label: "格式", items: ["bold", "italic", "strikethrough"] },
  { label: "标题", items: ["h2", "h3"] },
  { label: "内容", items: ["quote", "code", "codeBlock"] },
  { label: "媒体", items: ["link", "image", "hr"] },
  { label: "列表", items: ["ul", "ol"] },
] as const;

const TOOLBAR_COMMANDS: Record<string, { icon: string; label: string; title: string }> = {
  bold: { icon: "B", label: "format", title: "加粗" },
  italic: { icon: "I", label: "italic", title: "斜体" },
  strikethrough: { icon: "S", label: "strikethrough", title: "删除线" },
  h2: { icon: "H2", label: "heading", title: "二级标题" },
  h3: { icon: "H3", label: "heading", title: "三级标题" },
  quote: { icon: "❝", label: "quote", title: "引用" },
  code: { icon: "</>", label: "code", title: "行内代码" },
  codeBlock: { icon: "⌨", label: "codeBlock", title: "代码块" },
  link: { icon: "🔗", label: "link", title: "链接" },
  image: { icon: "🖼", label: "image", title: "图片" },
  hr: { icon: "—", label: "hr", title: "分割线" },
  ul: { icon: "≡", label: "ul", title: "无序列表" },
  ol: { icon: "1.", label: "ol", title: "有序列表" },
};

/*
 * Markdown 编辑器内容组件
 */

function WriteEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id");
  const articleId = rawId && /^\d+$/.test(rawId) ? Number(rawId) : undefined;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // 状态
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [syncScroll, setSyncScroll] = useState(true);
  const [draftBanner, setDraftBanner] = useState<{
    show: boolean;
    title: string;
    content: string;
    time: string;
  }>({ show: false, title: "", content: "", time: "" });

  // Auto save
  const { saveDraft, loadDraft } = useAutoSave({
    id: articleId,
    title,
    content,
  });

  // 加载草稿
  useEffect(() => {
    const draft = loadDraft();
    if (draft && !articleId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Draft loading is a one-time initialization, not a cascading render issue
      setDraftBanner({
        show: true,
        title: draft.title,
        content: draft.content,
        time: draft.savedAt ? new Date(draft.savedAt).toLocaleString() : "",
      });
    }
  }, [loadDraft, articleId]);

  // 读取从「导入文章」传递过来的 .md 文件内容
  useEffect(() => {
    if (articleId) return;
    if (loadDraft()) return;
    try {
      const raw = sessionStorage.getItem("import_article");
      if (!raw) return;
      sessionStorage.removeItem("import_article");
      const { fileName, content: importedContent } = JSON.parse(raw) as {
        fileName?: string;
        content?: string;
      };
      if (!importedContent) return;
      const h1Match = importedContent.match(/^\s*#\s+(.+)\s*$/m);
      // 使用 flushSync 批量同步更新状态，避免多次渲染
      flushSync(() => {
        setTitle(h1Match?.[1] ?? fileName ?? "");
        setContent(importedContent);
        setIsDirty(true);
      });
      toast.success(`已导入：${fileName ?? "Markdown 文件"}`);
    } catch {
      // 静默失败
    }
  }, [articleId, loadDraft]);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 恢复草稿
  const restoreDraft = () => {
    setTitle(draftBanner.title);
    setContent(draftBanner.content);
    setIsDirty(true);
    setDraftBanner((prev) => ({ ...prev, show: false }));
    toast.success("已恢复草稿");
  };

  // 丢弃草稿
  const discardDraft = () => {
    setDraftBanner((prev) => ({ ...prev, show: false }));
  };

  // 更新内容
  const updateContent = useCallback((value: string) => {
    setContent(value);
    setIsDirty(true);
  }, []);

  const updateTitle = useCallback((value: string) => {
    setTitle(value);
    setIsDirty(true);
  }, []);

  // 工具栏命令处理
  const handleCommand = useCallback((command: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.slice(start, end);

    let newText = text;
    let newCursorPos = start;

    switch (command) {
      case "bold":
        newText = text.slice(0, start) + `**${selected || "粗体文本"}**` + text.slice(end);
        newCursorPos = start + 2 + (selected ? selected.length + 2 : 4);
        break;
      case "italic":
        newText = text.slice(0, start) + `*${selected || "斜体文本"}*` + text.slice(end);
        newCursorPos = start + 1 + (selected ? selected.length + 1 : 4);
        break;
      case "strikethrough":
        newText = text.slice(0, start) + `~~${selected || "删除线文本"}~~` + text.slice(end);
        newCursorPos = start + 2 + (selected ? selected.length + 2 : 6);
        break;
      case "h2":
        // 在当前行开头添加 ##
        const lineStart2 = text.lastIndexOf("\n", start - 1) + 1;
        newText = text.slice(0, lineStart2) + "## " + text.slice(lineStart2);
        newCursorPos = start + 3;
        break;
      case "h3":
        const lineStart3 = text.lastIndexOf("\n", start - 1) + 1;
        newText = text.slice(0, lineStart3) + "### " + text.slice(lineStart3);
        newCursorPos = start + 4;
        break;
      case "quote":
        const lineStartQ = text.lastIndexOf("\n", start - 1) + 1;
        newText = text.slice(0, lineStartQ) + "> " + text.slice(lineStartQ);
        newCursorPos = start + 2;
        break;
      case "code":
        if (selected) {
          newText = text.slice(0, start) + "`" + selected + "`" + text.slice(end);
          newCursorPos = start + selected.length + 2;
        } else {
          newText = text.slice(0, start) + "`代码`" + text.slice(end);
          newCursorPos = start + 5;
        }
        break;
      case "codeBlock":
        newText = text.slice(0, start) + "\n```\n\n```\n" + text.slice(end);
        newCursorPos = start + 5;
        break;
      case "link":
        newText = text.slice(0, start) + `[${selected || "链接文本"}](url)` + text.slice(end);
        newCursorPos = start + (selected ? selected.length + 3 : 6);
        break;
      case "image":
        newText = text.slice(0, start) + `![${selected || "图片描述"}](url)` + text.slice(end);
        newCursorPos = start + (selected ? selected.length + 4 : 7);
        break;
      case "hr":
        newText = text.slice(0, start) + "\n---\n" + text.slice(end);
        newCursorPos = start + 5;
        break;
      case "ul":
        const lineStartUl = text.lastIndexOf("\n", start - 1) + 1;
        newText = text.slice(0, lineStartUl) + "- " + text.slice(lineStartUl);
        newCursorPos = start + 2;
        break;
      case "ol":
        const lineStartOl = text.lastIndexOf("\n", start - 1) + 1;
        newText = text.slice(0, lineStartOl) + "1. " + text.slice(lineStartOl);
        newCursorPos = start + 3;
        break;
    }

    textarea.value = newText;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    updateContent(newText);
    textarea.focus();
  }, [updateContent]);

  // 同步滚动处理
  const handleEditorScroll = useCallback(() => {
    if (!syncScroll || !previewRef.current || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const preview = previewRef.current;
    const scrollPercent = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight);
  }, [syncScroll]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            handleCommand("bold");
            break;
          case "i":
            e.preventDefault();
            handleCommand("italic");
            break;
          case "s":
            e.preventDefault();
            // 保存操作
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCommand]);

  // 渲染 Markdown 预览（简单实现，可根据需要扩展）
  const renderPreview = (markdown: string) => {
    // 简单转换，完整实现可使用 react-markdown
    const html = markdown
      // 转义 HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // 标题
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      // 引用
      .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
      // 列表
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
      // 粗体和斜体
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      // 代码块
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // 行内代码
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // 链接
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      // 图片
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
      // 段落
      .replace(/\n\n/g, "</p><p>")
      // 分割线
      .replace(/^---$/gm, "<hr />");

    return `<p>${html}</p>`;
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* 顶部工具栏 */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isDirty) {
                if (confirm("有未保存的更改，确定要离开吗？")) {
                  router.push("/admin/articles");
                }
              } else {
                router.push("/admin/articles");
              }
            }}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium">
            {articleId ? "编辑文章" : "新建文章"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <div className="flex items-center rounded-md border bg-muted p-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("h-7 w-7", viewMode === "editor" && "bg-card shadow-sm")}
              onClick={() => setViewMode("editor")}
              title="仅编辑器"
            >
              <FileText className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("h-7 w-7", viewMode === "split" && "bg-card shadow-sm")}
              onClick={() => setViewMode("split")}
              title="分屏"
            >
              <Columns2 className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("h-7 w-7", viewMode === "preview" && "bg-card shadow-sm")}
              onClick={() => setViewMode("preview")}
              title="仅预览"
            >
              {viewMode === "preview" ? (
                <Eye className="size-3.5" />
              ) : (
                <EyeOff className="size-3.5" />
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              saveDraft();
              toast.success("草稿已保存");
            }}
          >
            <Save className="mr-1 size-3.5" />
            保存草稿
          </Button>
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => {
              if (!title.trim()) {
                toast.error("请输入文章标题");
                return;
              }
              if (!content.trim()) {
                toast.error("请输入文章内容");
                return;
              }
              // 跳转到元信息编辑页面，传递 title 和 content
              sessionStorage.setItem(
                "article_draft",
                JSON.stringify({
                  articleTitle: title,
                  articleContent: content,
                })
              );
              router.push(articleId ? `/admin/articles/editor?id=${articleId}` : "/admin/articles/editor");
            }}
          >
            完成编辑
          </Button>
        </div>
      </header>

      {/* 草稿恢复提示 */}
      {draftBanner.show && (
        <div className="flex items-center justify-between border-b bg-amber-50 px-4 py-3 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400">
              <FileText className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">检测到未保存的草稿</p>
              <p className="text-xs text-muted-foreground">
                最后编辑于 {draftBanner.time}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={discardDraft}>
              丢弃
            </Button>
            <Button size="sm" onClick={restoreDraft}>
              恢复草稿
            </Button>
          </div>
        </div>
      )}

      {/* 标题输入 */}
      <div className="border-b px-4 py-3">
        <input
          type="text"
          value={title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="输入文章标题..."
          className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* 编辑器区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：工具栏 + 编辑器 */}
        <div
          ref={editorContainerRef}
          className={cn(
            "flex flex-col border-r",
            viewMode === "preview" && "hidden"
          )}
          style={{ width: viewMode === "split" ? "50%" : "100%" }}
        >
          {/* 工具栏 */}
          <div className="flex items-center gap-1 border-b bg-muted/50 px-3 py-2">
            {TOOLBAR_GROUPS.map((group, groupIndex) => (
              <div key={group.label} className="flex items-center">
                {groupIndex > 0 && <div className="mx-2 h-4 w-px bg-border" />}
                <span className="mr-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </span>
                {group.items.map((item) => {
                  const cmd = TOOLBAR_COMMANDS[item];
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleCommand(item)}
                      className="inline-flex size-8 items-center justify-center rounded-md text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      title={cmd?.title}
                    >
                      {cmd?.icon}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* 同步滚动开关 */}
          <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setSyncScroll(!syncScroll)}
              className={cn(
                "relative h-4 w-8 rounded-full transition-colors",
                syncScroll ? "bg-blue-500" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform",
                  syncScroll ? "left-4" : "left-0.5"
                )}
              />
            </button>
            <span>同步滚动</span>
          </div>

          {/* 文本编辑器 */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            onScroll={handleEditorScroll}
            placeholder="在这里输入 Markdown 内容...

# 文章标题

## 小节标题

正文内容...

```javascript
const hello = 'world';
```

> 引用文字

- 列表项 1
- 列表项 2"
            className="flex-1 resize-none bg-card p-4 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50"
            spellCheck={false}
          />
        </div>

        {/* 右侧：预览 */}
        <div
          ref={previewRef}
          className={cn(
            "overflow-y-auto bg-card",
            viewMode === "editor" && "hidden"
          )}
          style={{ width: viewMode === "split" ? "50%" : "100%" }}
        >
          <div className="p-6">
            {/* 预览标题 */}
            <h1 className="mb-4 text-2xl font-bold">{title || "无标题"}</h1>

            {/* 预览内容 */}
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
            />

            {!content && (
              <p className="text-muted-foreground">预览将在您开始输入后显示...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==============================
 * 页面入口
 * ============================== */

export default function WriteEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-muted-foreground">
          加载中...
        </div>
      }
    >
      <WriteEditorContent />
    </Suspense>
  );
}
