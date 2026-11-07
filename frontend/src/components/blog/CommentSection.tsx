"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Heart,
  ArrowBendUpLeft,
  Trash,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import { cn, formatTime } from "@/lib/utils";

export interface CommentNode {
  id: number;
  nickname: string;
  avatar?: string;
  content: string;
  createTime: string;
  likeCount?: number;
  children?: CommentNode[];
}

/**
 * 评论区（spec §4.7）
 * - 嵌套评论（最多一级回复）
 * - Enter 发送 / Shift+Enter 换行
 * - 时间显示为「几分钟前」
 */
export function CommentSection({
  comments,
  onSubmit,
  onReply,
  onLike,
  onDelete,
}: {
  comments: CommentNode[];
  onSubmit: (content: string) => Promise<void> | void;
  onReply: (parentId: number, content: string) => Promise<void> | void;
  onLike: (commentId: number) => Promise<void> | void;
  onDelete?: (commentId: number) => Promise<void> | void;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const v = content.trim();
    if (!v || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(v);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-20 border-t border-blog-line pt-10">
      <h3 className="mb-5 text-[11px] font-medium tracking-[0.18em] text-blog-soft uppercase">
        评论
      </h3>

      {/* 输入区 */}
      <div className="mb-8 rounded-xl border border-blog-line bg-blog-surface">
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="写下你的评论..."
          className="w-full resize-none rounded-xl border-0 bg-transparent px-4 py-3 text-sm text-blog-ink placeholder:text-blog-soft/60 focus:outline-none"
        />
        <div className="flex items-center justify-between border-t border-blog-line px-4 py-2 text-[11px] text-blog-soft">
          <span>Enter 发送 · Shift+Enter 换行</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setContent("")}
              className="rounded-full px-3 py-1 text-blog-soft transition-colors hover:bg-blog-muted hover:text-blog-ink"
            >
              清空
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="inline-flex items-center gap-1.5 rounded-full bg-blog-ink px-3.5 py-1 font-medium text-blog-bg transition-opacity hover:opacity-85 disabled:opacity-40"
            >
              <PaperPlaneTilt className="h-3 w-3" />
              发表
            </button>
          </div>
        </div>
      </div>

      {/* 列表 */}
      <ul className="divide-y divide-blog-line">
        {comments.length === 0 && (
          <li className="py-12 text-center text-sm text-blog-soft">
            还没有评论，来抢沙发吧~
          </li>
        )}
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            onReply={onReply}
            onLike={onLike}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  );
}

function CommentItem({
  comment,
  onReply,
  onLike,
  onDelete,
  depth = 0,
}: {
  comment: CommentNode;
  onReply: (parentId: number, content: string) => Promise<void> | void;
  onLike: (commentId: number) => Promise<void> | void;
  onDelete?: (commentId: number) => Promise<void> | void;
  depth?: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount ?? 0);

  const submitReply = async () => {
    const v = replyText.trim();
    if (!v) return;
    await onReply(comment.id, v);
    setReplyText("");
    setReplyOpen(false);
  };

  return (
    <li className="py-4">
      <div className="flex gap-3">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-blog-muted">
          {comment.avatar ? (
            <Image
              src={comment.avatar}
              alt={comment.nickname}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[12px] font-medium text-blog-soft">
              {comment.nickname?.[0] || "U"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="font-medium text-blog-ink">
              {comment.nickname}
            </span>
            <span className="text-[11px] text-blog-soft">• {formatTime(comment.createTime)}</span>
          </div>
          <div className="mt-1 break-words whitespace-pre-wrap text-[13.5px] leading-relaxed text-blog-ink/80">
            {comment.content}
          </div>
          <div className="mt-2 flex items-center gap-4 text-[11px] text-blog-soft">
            <button
              type="button"
              onClick={async () => {
                setLiked((v) => !v);
                setLikeCount((c) => (liked ? c - 1 : c + 1));
                await onLike(comment.id);
              }}
              className={cn(
                "inline-flex items-center gap-1 transition-colors",
                liked
                  ? "text-blog-ink"
                  : "hover:text-blog-ink",
              )}
            >
              <Heart
                weight={liked ? "fill" : "regular"}
                className="h-3.5 w-3.5"
              />
              <span>{likeCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setReplyOpen((v) => !v)}
              className="inline-flex items-center gap-1 transition-colors hover:text-blog-ink"
            >
              <ArrowBendUpLeft className="h-3.5 w-3.5" />
              回复
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="inline-flex items-center gap-1 transition-colors hover:text-red-500"
              >
                <Trash className="h-3.5 w-3.5" />
                删除
              </button>
            )}
          </div>

          {replyOpen && (
            <div className="mt-3 rounded-xl border border-blog-line bg-blog-muted p-3">
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitReply();
                  }
                }}
                placeholder={`回复 @${comment.nickname}...`}
                className="w-full resize-none rounded-lg border border-blog-line bg-blog-surface px-3 py-2 text-sm text-blog-ink placeholder:text-blog-soft/60 focus:border-blog-ink focus:outline-none"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyOpen(false)}
                  className="rounded-full px-3 py-1 text-[11px] text-blog-soft transition-colors hover:text-blog-ink"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                  className="rounded-full bg-blog-ink px-3 py-1 text-[11px] font-medium text-blog-bg transition-opacity hover:opacity-85 disabled:opacity-40"
                >
                  发送
                </button>
              </div>
            </div>
          )}

          {comment.children && comment.children.length > 0 && (
            <ul className={cn("mt-3 space-y-3", depth === 0 && "ml-8")}>
              {comment.children.map((child) => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  onReply={onReply}
                  onLike={onLike}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}