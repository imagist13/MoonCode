"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Reply, Trash2, Send } from "lucide-react";
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
  currentUser,
}: {
  comments: CommentNode[];
  onSubmit: (content: string) => Promise<void> | void;
  onReply: (parentId: number, content: string) => Promise<void> | void;
  onLike: (commentId: number) => Promise<void> | void;
  onDelete?: (commentId: number) => Promise<void> | void;
  currentUser?: { nickname: string; avatar?: string };
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
    <section className="mt-10 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
        评论
      </h3>

      {/* 输入区 */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
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
          className="w-full resize-none rounded-lg border-0 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
        />
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-xs text-gray-400 dark:border-gray-700">
          <span>Enter 发送 · Shift+Enter 换行</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setContent("")}
              className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              清空
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="inline-flex items-center gap-1 rounded bg-blue-500 px-3 py-1 font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
            >
              <Send className="h-3 w-3" />
              发表
            </button>
          </div>
        </div>
      </div>

      {/* 列表 */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {comments.length === 0 && (
          <li className="py-10 text-center text-sm text-gray-400">
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
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          {comment.avatar ? (
            <Image
              src={comment.avatar}
              alt={comment.nickname}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-medium text-white">
              {comment.nickname?.[0] || "U"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {comment.nickname}
            </span>
            <span className="text-xs text-gray-400">• {formatTime(comment.createTime)}</span>
          </div>
          <div className="mt-1 break-words whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {comment.content}
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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
                  ? "text-red-500"
                  : "hover:text-red-500",
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
              <span>{likeCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setReplyOpen((v) => !v)}
              className="inline-flex items-center gap-1 hover:text-blue-500"
            >
              <Reply className="h-3.5 w-3.5" />
              回复
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="inline-flex items-center gap-1 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                删除
              </button>
            )}
          </div>

          {replyOpen && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
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
                className="w-full resize-none rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyOpen(false)}
                  className="rounded px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                  className="rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50"
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