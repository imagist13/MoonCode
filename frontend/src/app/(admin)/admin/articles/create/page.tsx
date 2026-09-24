"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { flushSync } from "react-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SmartTagInput } from "@/components/editor/smart-tag-input";
import { CoverImageUploader } from "@/components/editor/cover-image-uploader";
import { useAutoSave } from "@/hooks/use-auto-save";
import { articleSchema, type ArticleFormData } from "@/lib/validations/article";
import { toast } from "sonner";
import { ZodError } from "zod";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Columns2,
  FileText,
  X,
  Settings2,
  Send,
} from "lucide-react";

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

const TOOLBAR_COMMANDS: Record<
  string,
  { icon: string; label: string; title: string }
> = {
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

/* ==============================
 * 类型
 * ============================== */

interface Category {
  id: number;
  categoryName: string;
}

interface Tag {
  id: number;
  tagName: string;
}

type ViewMode = "editor" | "split" | "preview";

/* ==============================
 * Markdown 渲染（简单实现）
 * ============================== */

function renderPreview(markdown: string): string {
  const html = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(
      /```(\w*)\n([\s\S]*?)```/g,
      '<pre><code class="language-$1">$2</code></pre>'
    )
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(
      /!\[(.+?)\]\((.+?)\)/g,
      '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:16px 0;" />'
    )
    .replace(/\n\n/g, "</p><p>")
    .replace(/^---$/gm, "<hr />");

  return `<p>${html}</p>`;
}

/* ==============================
 * 主内容组件
 * ============================== */

function UnifiedEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id");
  const articleId =
    rawId && /^\d+$/.test(rawId) ? Number(rawId) : undefined;

  /* ---------- 状态 ---------- */
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<ArticleFormData>({
    id: undefined,
    articleTitle: "",
    articleContent: "",
    categoryName: "",
    tagNameList: [],
    articleCover: "",
    type: 1,
    status: 1,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [syncScroll, setSyncScroll] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 草稿恢复提示
  const [draftBanner, setDraftBanner] = useState<{
    show: boolean;
    articleTitle: string;
    articleContent: string;
    savedAt: string;
  }>({ show: false, articleTitle: "", articleContent: "", savedAt: "" });

  /* ---------- Auto Save ---------- */
  const { saveDraft, loadDraft, clearDraft } = useAutoSave({
    id: articleId,
    title: form.articleTitle,
    content: form.articleContent,
  });

  /* ---------- 初始化 ---------- */
  useEffect(() => {
    // 加载草稿
    const draft = loadDraft();
    if (draft && !articleId) {
      setDraftBanner({
        show: true,
        articleTitle: draft.title,
        articleContent: draft.content,
        savedAt: draft.savedAt ? new Date(draft.savedAt).toLocaleString() : "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 读取从导入文章传递过来的内容
    if (articleId) return;
    if (loadDraft()) return;
    try {
      const raw = sessionStorage.getItem("import_article");
      if (!raw) return;
      sessionStorage.removeItem("import_article");
      const { fileName, content } = JSON.parse(raw) as {
        fileName?: string;
        content?: string;
      };
      if (!content) return;
      const h1Match = content.match(/^\s*#\s+(.+)\s*$/m);
      flushSync(() => {
        setForm((prev) => ({
          ...prev,
          articleTitle: h1Match?.[1] ?? fileName ?? "",
          articleContent: content,
        }));
        setIsDirty(true);
      });
      toast.success(`已导入：${fileName ?? "Markdown 文件"}`);
    } catch {
      // 静默失败
    }
  }, [articleId, loadDraft]);

  // 加载分类和标签
  useEffect(() => {
    api
      .get<Category[] | { records: Category[] }>("/admin/categories")
      .then((res) => {
        if (res.flag) {
          const data = res.data;
          setCategories(Array.isArray(data) ? data : data.records);
        }
      })
      .catch((err) => console.error("加载分类失败:", err));

    api
      .get<Tag[] | { records: Tag[] }>("/admin/tags")
      .then((res) => {
        if (res.flag) {
          const data = res.data;
          setAvailableTags(Array.isArray(data) ? data : data.records);
        }
      })
      .catch((err) => console.error("加载标签失败:", err));
  }, []);

  // 加载文章数据（编辑模式）
  useEffect(() => {
    if (!articleId) return;
    api
      .get<{
        id: number;
        articleTitle: string;
        articleContent: string;
        articleCover: string;
        type: number;
        status: number;
        category?: { categoryName: string };
        tags?: { tagName: string }[];
      }>(`/admin/articles/${articleId}`)
      .then((res) => {
        if (!res.flag || !res.data) return;
        const d = res.data;
        setForm({
          id: d.id,
          articleTitle: d.articleTitle ?? "",
          articleContent: d.articleContent ?? "",
          articleCover: d.articleCover ?? "",
          type: d.type ?? 1,
          status: d.status ?? 1,
          categoryName: d.category?.categoryName ?? "",
          tagNameList: (d.tags ?? []).map((t) => t.tagName),
        });
      });
  }, [articleId]);

  // 离开页面提示
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // 现代浏览器需要设置 returnValue 才能显示对话框
        Object.defineProperty(e, "returnValue", {
          get: () => "",
          configurable: true,
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  /* ---------- 字段更新 ---------- */
  const updateField = useCallback(
    <K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const validateField = useCallback(
    (key: keyof ArticleFormData) => {
      try {
        articleSchema.shape[key].parse(form[key]);
        setErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      } catch (err) {
        if (err instanceof ZodError) {
          const issues = err.issues || [];
          setErrors((prev) => ({
            ...prev,
            [key]: issues[0]?.message || "",
          }));
        }
      }
    },
    [form]
  );

  /* ---------- 草稿操作 ---------- */
  const restoreDraft = () => {
    setForm((prev) => ({
      ...prev,
      articleTitle: draftBanner.articleTitle,
      articleContent: draftBanner.articleContent,
    }));
    setIsDirty(true);
    setDraftBanner((prev) => ({ ...prev, show: false }));
    toast.success("已恢复草稿");
  };

  const discardDraft = () => {
    setDraftBanner((prev) => ({ ...prev, show: false }));
  };

  /* ---------- 工具栏命令 ---------- */
  const handleCommand = useCallback(
    (command: string) => {
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
          newText =
            text.slice(0, start) +
            `**${selected || "粗体文本"}**` +
            text.slice(end);
          newCursorPos = start + 2 + (selected ? selected.length + 2 : 4);
          break;
        case "italic":
          newText =
            text.slice(0, start) +
            `*${selected || "斜体文本"}*` +
            text.slice(end);
          newCursorPos = start + 1 + (selected ? selected.length + 1 : 4);
          break;
        case "strikethrough":
          newText =
            text.slice(0, start) +
            `~~${selected || "删除线文本"}~~` +
            text.slice(end);
          newCursorPos = start + 2 + (selected ? selected.length + 2 : 6);
          break;
        case "h2": {
          const lineStart2 = text.lastIndexOf("\n", start - 1) + 1;
          newText = text.slice(0, lineStart2) + "## " + text.slice(lineStart2);
          newCursorPos = start + 3;
          break;
        }
        case "h3": {
          const lineStart3 = text.lastIndexOf("\n", start - 1) + 1;
          newText =
            text.slice(0, lineStart3) + "### " + text.slice(lineStart3);
          newCursorPos = start + 4;
          break;
        }
        case "quote": {
          const lineStartQ = text.lastIndexOf("\n", start - 1) + 1;
          newText = text.slice(0, lineStartQ) + "> " + text.slice(lineStartQ);
          newCursorPos = start + 2;
          break;
        }
        case "code":
          if (selected) {
            newText =
              text.slice(0, start) + "`" + selected + "`" + text.slice(end);
            newCursorPos = start + selected.length + 2;
          } else {
            newText =
              text.slice(0, start) + "`代码`" + text.slice(end);
            newCursorPos = start + 5;
          }
          break;
        case "codeBlock":
          newText =
            text.slice(0, start) + "\n```\n\n```\n" + text.slice(end);
          newCursorPos = start + 5;
          break;
        case "link":
          newText =
            text.slice(0, start) +
            `[${selected || "链接文本"}](url)` +
            text.slice(end);
          newCursorPos = start + (selected ? selected.length + 3 : 6);
          break;
        case "image":
          newText =
            text.slice(0, start) +
            `![${selected || "图片描述"}](url)` +
            text.slice(end);
          newCursorPos = start + (selected ? selected.length + 4 : 7);
          break;
        case "hr":
          newText = text.slice(0, start) + "\n---\n" + text.slice(end);
          newCursorPos = start + 5;
          break;
        case "ul": {
          const lineStartUl = text.lastIndexOf("\n", start - 1) + 1;
          newText = text.slice(0, lineStartUl) + "- " + text.slice(lineStartUl);
          newCursorPos = start + 2;
          break;
        }
        case "ol": {
          const lineStartOl = text.lastIndexOf("\n", start - 1) + 1;
          newText =
            text.slice(0, lineStartOl) + "1. " + text.slice(lineStartOl);
          newCursorPos = start + 3;
          break;
        }
      }

      textarea.value = newText;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      updateField("articleContent", newText);
      textarea.focus();
    },
    [updateField]
  );

  /* ---------- 同步滚动 ---------- */
  const handleEditorScroll = useCallback(() => {
    if (!syncScroll || !previewRef.current || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const preview = previewRef.current;
    const scrollPercent =
      textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    preview.scrollTop =
      scrollPercent * (preview.scrollHeight - preview.clientHeight);
  }, [syncScroll]);

  /* ---------- 键盘快捷键 ---------- */
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
            saveDraft();
            toast.success("草稿已保存");
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCommand, saveDraft]);

  /* ---------- 发布 / 保存 ---------- */
  const handlePublish = async () => {
    try {
      articleSchema.parse(form);
    } catch (err) {
      if (err instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        (err.issues || []).forEach((e) => {
          const path = String(e.path[0]);
          newErrors[path] = e.message;
        });
        setErrors(newErrors);
        toast.error("请检查表单填写是否正确");
        setShowSettings(true);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await api.post("/admin/articles", form);
      if (res.flag) {
        toast.success("发布成功");
        clearDraft();
        setIsDirty(false);
        router.push("/admin/articles");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "发布失败");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => {
    saveDraft();
    toast.success("草稿已保存");
  };

  const handleCoverUpload = useCallback(async (file: File): Promise<string> => {
    const res = await api.upload<string>("/admin/articles/images", file);
    if (!res.flag) throw new Error(res.message);
    return res.data;
  }, []);

  /* ---------- 视图切换标签 ---------- */
  const VIEW_TABS: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: "editor", label: "编辑", icon: <FileText className="size-3.5" /> },
    { mode: "split", label: "分屏", icon: <Columns2 className="size-3.5" /> },
    {
      mode: "preview",
      label: "预览",
      icon:
        viewMode === "preview" ? (
          <Eye className="size-3.5" />
        ) : (
          <EyeOff className="size-3.5" />
        ),
    },
  ];

  /* ==============================
   * 渲染
   * ============================== */

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ---------- 顶部导航栏 ---------- */}
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
            {articleId ? "编辑文章" : "写文章"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <div className="flex items-center rounded-md border bg-muted p-0.5">
            {VIEW_TABS.map((tab) => (
              <Button
                key={tab.mode}
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "h-7 w-7",
                  viewMode === tab.mode && "bg-card shadow-sm"
                )}
                onClick={() => setViewMode(tab.mode)}
                title={tab.label}
              >
                {tab.icon}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="mr-1 size-3.5" />
            保存草稿
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 className="mr-1 size-3.5" />
            摘要/设置
          </Button>

          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={handlePublish}
            disabled={saving}
          >
            <Send className="mr-1 size-3.5" />
            {saving ? "发布中..." : "发布文章"}
          </Button>
        </div>
      </header>

      {/* ---------- 草稿恢复提示 ---------- */}
      {draftBanner.show && (
        <div className="flex items-center justify-between border-b bg-amber-50 px-4 py-3 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400">
              <FileText className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">检测到未保存的草稿</p>
              <p className="text-xs text-muted-foreground">
                {draftBanner.savedAt} · {draftBanner.articleTitle || "无标题"}
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

      {/* ---------- 主内容区 ---------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：编辑器 */}
        <div
          className={cn(
            "flex flex-col",
            showSettings ? "w-[calc(100%-380px)]" : "flex-1",
            viewMode === "preview" && "hidden"
          )}
          style={{
            width:
              viewMode === "split"
                ? showSettings
                  ? "calc(100% - 380px)"
                  : "50%"
                : viewMode === "editor"
                  ? showSettings
                    ? "calc(100% - 380px)"
                    : "100%"
                  : undefined,
            transition: "width 0.3s ease",
          }}
        >
          {/* 标题输入 */}
          <div className="border-b px-4 py-3">
            <input
              type="text"
              value={form.articleTitle}
              onChange={(e) => updateField("articleTitle", e.target.value)}
              onBlur={() => validateField("articleTitle")}
              placeholder="在这里输入文章标题..."
              className={cn(
                "w-full bg-transparent text-xl font-semibold outline-none placeholder:text-muted-foreground",
                errors.articleTitle && "text-destructive"
              )}
            />
            {errors.articleTitle && (
              <p className="mt-1 text-xs text-destructive">
                {errors.articleTitle}
              </p>
            )}
          </div>

          {/* 工具栏 */}
          <div className="flex items-center gap-1 border-b bg-muted/50 px-3 py-2">
            {TOOLBAR_GROUPS.map((group, groupIndex) => (
              <div key={group.label} className="flex items-center">
                {groupIndex > 0 && (
                  <div className="mx-2 h-4 w-px bg-border" />
                )}
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
            value={form.articleContent}
            onChange={(e) => updateField("articleContent", e.target.value)}
            onScroll={handleEditorScroll}
            placeholder={`在这里开始写作...

# 文章标题

## 小节标题

正文内容，支持 **加粗**、*斜体*、\`行内代码\`

\`\`\`javascript
// 代码块示例
const greeting = 'Hello, World!';
console.log(greeting);
\`\`\`

> 这是一段引用文字

- 列表项 1
- 列表项 2

[链接文字](https://example.com)

![图片描述](https://via.placeholder.com/600x300)`}
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
          style={{
            width:
              viewMode === "split"
                ? showSettings
                  ? "380px"
                  : "50%"
                : viewMode === "preview"
                  ? "100%"
                  : undefined,
            transition: "width 0.3s ease",
          }}
        >
          <div className="p-6">
            {/* 预览标题 */}
            <h1
              className={cn(
                "mb-4 border-b pb-3 text-2xl font-bold",
                !form.articleTitle && "text-muted-foreground"
              )}
            >
              {form.articleTitle || "在这里输入文章标题..."}
            </h1>

            {/* 预览内容 */}
            {form.articleContent ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: renderPreview(form.articleContent),
                }}
              />
            ) : (
              <p className="text-muted-foreground">
                预览将在您开始输入后显示...
              </p>
            )}
          </div>
        </div>

        {/* ---------- 右侧设置面板 ---------- */}
        <aside
          className={cn(
            "flex flex-col border-l bg-card transition-all duration-300",
            showSettings ? "w-95" : "w-0 overflow-hidden"
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
            <span className="text-sm font-semibold">文章设置</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* 封面图 */}
            <div className="border-b p-5">
              <Label className="mb-3 block text-sm font-medium">
                封面图
              </Label>
              <CoverImageUploader
                value={form.articleCover}
                onChange={(url) => updateField("articleCover", url)}
                onUpload={handleCoverUpload}
              />
            </div>

            {/* 分类 */}
            <div className="border-b p-5">
              <Label htmlFor="category" className="mb-2 block text-sm font-medium">
                分类 <span className="text-destructive">*</span>
              </Label>
              <select
                id="category"
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  errors.categoryName && "border-destructive"
                )}
                value={form.categoryName}
                onChange={(e) => updateField("categoryName", e.target.value)}
                onBlur={() => validateField("categoryName")}
              >
                <option value="">请选择分类</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.categoryName}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
              {errors.categoryName && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.categoryName}
                </p>
              )}
            </div>

            {/* 标签 */}
            <div className="border-b p-5">
              <Label className="mb-2 block text-sm font-medium">
                标签 <span className="text-destructive">*</span>
              </Label>
              <SmartTagInput
                value={form.tagNameList}
                onChange={(tags) => updateField("tagNameList", tags)}
                availableTags={availableTags.map((t) => t.tagName)}
                maxTags={5}
                placeholder="输入标签后按 Enter 添加"
              />
              {errors.tagNameList && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.tagNameList}
                </p>
              )}
            </div>

            {/* 文章类型 */}
            <div className="border-b p-5">
              <Label className="mb-2 block text-sm font-medium">
                文章类型
              </Label>
              <div className="flex gap-2">
                {[
                  { value: 1, label: "原创" },
                  { value: 2, label: "转载" },
                  { value: 3, label: "翻译" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField("type", opt.value)}
                    className={cn(
                      "flex-1 rounded-md border py-2 text-sm transition-colors",
                      form.type === opt.value
                        ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950"
                        : "border-input hover:border-blue-500 hover:text-blue-500"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 可见性 */}
            <div className="border-b p-5">
              <Label className="mb-2 block text-sm font-medium">
                可见性
              </Label>
              <div className="flex gap-2">
                {[
                  { value: 1, label: "公开" },
                  { value: 2, label: "私密" },
                  { value: 3, label: "草稿" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField("status", opt.value)}
                    className={cn(
                      "flex-1 rounded-md border py-2 text-sm transition-colors",
                      form.status === opt.value
                        ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950"
                        : "border-input hover:border-blue-500 hover:text-blue-500"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 底部操作 */}
          <div className="border-t p-5">
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={handlePublish}
              disabled={saving}
            >
              <Send className="mr-2 size-4" />
              {saving ? "发布中..." : "发布文章"}
            </Button>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={handleSaveDraft}
            >
              <Save className="mr-2 size-4" />
              保存草稿
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ==============================
 * 页面入口
 * ============================== */

export default function UnifiedEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-muted-foreground">
          加载中...
        </div>
      }
    >
      <UnifiedEditorContent />
    </Suspense>
  );
}
