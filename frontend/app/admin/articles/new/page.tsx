"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/post/markdown-renderer";
import { useSessionStore } from "@/stores/session-store";
import { useThemeStore } from "@/stores/ui-store";
import { createArticle } from "@/lib/api/articles";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export default function NewArticlePage() {
  const router = useRouter();
  const token = useSessionStore((s) => s.token);
  const theme = useThemeStore((s) => s.theme);

  const [form, setForm] = React.useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "# 在这里写下你的第一段\n\n支持 **Markdown**，包括：\n\n- 列表\n- `code`\n- [链接](https://moon.dev)\n\n> 写一段引用\n",
    cover: "",
    status: "published" as "draft" | "published",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const onTitleBlur = () => {
    if (!form.slug) update("slug", slugify(form.title));
  };

  const onSubmit = async (publish: boolean) => {
    if (!token) {
      setError("请先登录");
      return;
    }
    if (!form.title.trim()) {
      setError("标题不能为空");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const a = await createArticle({
        token,
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content,
        cover: form.cover.trim() || undefined,
        status: publish ? "published" : "draft",
      });
      router.push(`/articles/${a.slug}` as never);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  // 编辑器主题与站点同步：dark 时给 code block 深底，light 时浅底
  const previewClass = theme === "dark" ? "prose-invert" : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">写文章</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Markdown 编辑器 · 实时预览
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => onSubmit(false)}
          >
            <Save className="h-4 w-4" /> 保存草稿
          </Button>
          <Button disabled={submitting} onClick={() => onSubmit(true)}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            发布
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              onBlur={onTitleBlur}
              placeholder="给文章一个名字"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="自动生成"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="excerpt">摘要</Label>
            <Textarea
              id="excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="一句话简介，可空"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="cover">封面 URL（可选）</Label>
            <Input
              id="cover"
              value={form.cover}
              onChange={(e) => update("cover", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">编辑</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={20}
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              className="font-mono text-sm"
              placeholder="开始写 Markdown…"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">预览</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer
              content={form.content || "*(空内容)*"}
              className={previewClass}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}