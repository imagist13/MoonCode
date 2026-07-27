"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/stores/editor-store";
import { toast } from "@/components/ui/toast";

/**
 * 后台文章编辑器骨架 —— 使用 Zustand 持久化草稿。
 * 具体保存逻辑（调用后端）留给上层调用方接管。
 */
export function EditorShell({
  onSubmit,
}: {
  onSubmit?: (draft: ReturnType<typeof useEditorStore.getState>["draft"]) => Promise<void> | void;
}) {
  const draft = useEditorStore((s) => s.draft);
  const update = useEditorStore((s) => s.update);
  const reset = useEditorStore((s) => s.reset);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast({ title: "请补全标题与正文", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit?.(draft);
      toast({ title: "已保存", variant: "success" });
    } catch (err) {
      toast({
        title: "保存失败",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">标题</Label>
          <Input
            id="title"
            value={draft.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Give it a name…"
            className="h-12 font-serif text-2xl italic"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">摘要</Label>
          <Textarea
            id="summary"
            value={draft.summary}
            onChange={(e) => update({ summary: e.target.value })}
            placeholder="一句话摘要"
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">正文（Markdown）</Label>
          <Textarea
            id="content"
            value={draft.content}
            onChange={(e) => update({ content: e.target.value })}
            placeholder="# Hello"
            className="min-h-[520px] font-mono text-sm"
          />
        </div>
      </div>
      <aside className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={draft.slug}
            onChange={(e) => update({ slug: e.target.value })}
            placeholder="url-slug"
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cover">封面图 URL</Label>
          <Input
            id="cover"
            value={draft.cover}
            onChange={(e) => update({ cover: e.target.value })}
            placeholder="https://…"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
            {submitting ? "保存中…" : "保存"}
          </Button>
          <Button variant="outline" onClick={reset} disabled={submitting}>
            清空
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          草稿会自动保存在浏览器本地，切换页面不会丢失。
        </p>
      </aside>
    </div>
  );
}
