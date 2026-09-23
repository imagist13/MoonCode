"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, ArrowLeft, X, FileText } from "lucide-react";
import { SmartTagInput, CoverImageUploader } from "@/components/editor";
import { useAutoSave } from "@/hooks/use-auto-save";
import { articleSchema, type ArticleFormData } from "@/lib/validations/article";
import { ZodError } from "zod";
import { cn } from "@/lib/utils";

/* ==============================
 * 数据类型
 * ============================== */

interface Category {
  id: number;
  categoryName: string;
}

interface Tag {
  id: number;
  tagName: string;
}

/* ==============================
 * 文章编辑器内容组件
 * ============================== */

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id");
  const articleId = rawId && /^\d+$/.test(rawId) ? Number(rawId) : undefined;

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
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftData, setDraftData] = useState<ArticleFormData | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Auto save
  const { loadDraft, clearDraft } = useAutoSave({
    id: articleId,
    title: form.articleTitle,
    content: form.articleContent,
  });

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && !articleId) {
      setDraftData({
        articleTitle: draft.title,
        articleContent: draft.content,
        categoryName: "",
        tagNameList: [],
        articleCover: "",
        type: 1,
        status: 1,
      });
      setShowDraftDialog(true);
    }
  }, [loadDraft, articleId]);

  // 读取从写作页面传来的文章内容
  useEffect(() => {
    if (articleId) return;
    if (loadDraft()) return;
    try {
      const draftRaw = sessionStorage.getItem("article_draft");
      if (draftRaw) {
        sessionStorage.removeItem("article_draft");
        const { articleTitle, articleContent } = JSON.parse(draftRaw);
        setForm((prev) => ({
          ...prev,
          articleTitle: articleTitle || prev.articleTitle,
          articleContent: articleContent || prev.articleContent,
        }));
        setIsDirty(true);
        toast.success("已加载文章内容");
        return;
      }
    } catch {
      // 静默失败
    }

    // 也检查从导入文章传来的内容
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
      const title = h1Match?.[1] ?? fileName ?? "";
      setForm((prev) => ({
        ...prev,
        articleTitle: title,
        articleContent: content,
      }));
      setIsDirty(true);
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

  // Load categories and tags
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
          setTags(Array.isArray(data) ? data : data.records);
        }
      })
      .catch((err) => console.error("加载标签失败:", err));
  }, []);

  // Load article data in edit mode
  useEffect(() => {
    if (articleId) {
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
    }
  }, [articleId]);

  const updateField = useCallback(<K extends keyof ArticleFormData>(
    key: K,
    value: ArticleFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const validateField = useCallback((key: keyof ArticleFormData) => {
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
        setErrors((prev) => ({ ...prev, [key]: issues[0]?.message || "" }));
      }
    }
  }, [form]);

  const handleSave = async () => {
    try {
      articleSchema.parse(form);
    } catch (err) {
      if (err instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        const issues = err.issues || [];
        issues.forEach((e) => {
          const path = String(e.path[0]);
          newErrors[path] = e.message;
        });
        setErrors(newErrors);
        toast.error("请检查表单填写是否正确");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await api.post("/admin/articles", form);
      if (res.flag) {
        toast.success("保存成功");
        clearDraft();
        setIsDirty(false);
        router.push("/admin/articles");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = useCallback(async (file: File): Promise<string> => {
    const res = await api.upload<string>("/admin/articles/images", file);
    if (!res.flag) throw new Error(res.message);
    return res.data;
  }, []);

  const restoreDraft = () => {
    if (draftData) {
      setForm(draftData);
      setIsDirty(true);
    }
    setShowDraftDialog(false);
  };

  const discardDraft = () => {
    setShowDraftDialog(false);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* 顶部工具栏 */}
      <div className="flex items-center gap-3 border-b pb-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <Input
          id="title"
          placeholder="请输入文章标题"
          value={form.articleTitle}
          onChange={(e) => updateField("articleTitle", e.target.value)}
          onBlur={() => validateField("articleTitle")}
          className={cn(
            "h-10 flex-1 border-transparent bg-transparent text-lg font-semibold shadow-none focus-visible:border-input focus-visible:ring-0",
            errors.articleTitle && "border-destructive"
          )}
        />
        <Button variant="ghost" onClick={() => router.push("/admin/articles")}>
          <X className="size-4" />
          取消
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-1 size-4" />
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>

      {/* 错误提示 */}
      {errors.articleTitle && (
        <p className="text-sm text-destructive">{errors.articleTitle}</p>
      )}

      {/* Draft Recovery Dialog */}
      {showDraftDialog && (
        <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400">
              <FileText className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                检测到未保存的草稿
              </p>
              <p className="text-xs text-muted-foreground">
                {draftData?.articleTitle || "无标题"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={discardDraft}>
              丢弃
            </Button>
            <Button size="sm" onClick={restoreDraft}>
              恢复草稿
            </Button>
          </div>
        </div>
      )}

      {/* 主内容区 - 卡片布局 */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* 元信息卡片 */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">文章设置</h3>

          {/* Category & Type & Status */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm">分类 *</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                <p className="text-sm text-destructive">{errors.categoryName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm">类型</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.type}
                onChange={(e) => updateField("type", Number(e.target.value))}
              >
                <option value={1}>原创</option>
                <option value={2}>转载</option>
                <option value={3}>翻译</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm">状态</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.status}
                onChange={(e) => updateField("status", Number(e.target.value))}
              >
                <option value={1}>公开</option>
                <option value={2}>私密</option>
                <option value={3}>草稿</option>
              </select>
            </div>
          </div>
        </div>

        {/* 标签卡片 */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">标签</h3>
          <SmartTagInput
            value={form.tagNameList}
            onChange={(tags) => updateField("tagNameList", tags)}
            availableTags={tags.map((t) => t.tagName)}
            maxTags={10}
          />
          {errors.tagNameList && (
            <p className="mt-2 text-sm text-destructive">{errors.tagNameList}</p>
          )}
        </div>

        {/* 封面图卡片 */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">封面图</h3>
          <CoverImageUploader
            value={form.articleCover}
            onChange={(url) => updateField("articleCover", url)}
            onUpload={handleCoverUpload}
          />
        </div>

        {/* 文章内容预览 */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">文章内容预览</h3>
          <div className="max-h-96 overflow-y-auto rounded-md bg-muted/30 p-4">
            {form.articleContent ? (
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                {form.articleContent.slice(0, 1000)}
                {form.articleContent.length > 1000 && "..."}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground/50">
                暂无内容，请点击「写作」按钮编写文章
              </p>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            字数：{form.articleContent.length}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==============================
 * 页面入口
 * ============================== */

export default function ArticleEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          加载中...
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
