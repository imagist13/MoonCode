"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Plus } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: number;
  nickname: string;
  avatar: string;
  messageContent: string;
  createTime: string;
}

/** 纸张颗粒：内联 SVG 噪声，叠加在纸张底色上模拟纤维纹理 */
const PAPER_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

/** 五种旧纸色：牛皮、冷白、草绿、旧粉、灰紫；暗色下也保持浅纸质感 */
const PAPERS = [
  { card: "border-[#dfd1b3] bg-[#faf4e3]" },
  { card: "border-[#c8d4db] bg-[#eff2f4]" },
  { card: "border-[#c9d7c0] bg-[#eff4ea]" },
  { card: "border-[#e3cbc2] bg-[#fbf0ec]" },
  { card: "border-[#d3ccdf] bg-[#f4f1f8]" },
];

const PAPER_TEXT = "text-[#3a3226]";
const PAPER_SOFT = "text-[#8b7d67]";

/** 每张纸的固定倾斜角，像随手钉上去的 */
function tiltOf(id: number): number {
  return (((id * 37) % 11) - 5) * 0.52;
}

/** 每一行里的高低错落，几张纸不会挤在同一条基线上 */
function dropOf(id: number): number {
  return (((id * 53) % 7) - 3) * 3;
}

/** 从几个固定档位里挑纸张尺寸，长短、大小都错开 */
const PAPER_WIDTHS = [8.5, 11, 13.5, 16, 18.5];
const PAPER_HEIGHTS = [4.75, 5.5, 6.25, 7];

function paperSizeOf(id: number) {
  return {
    width: `min(${PAPER_WIDTHS[(id * 7) % PAPER_WIDTHS.length]}rem, 100%)`,
    minHeight: `${PAPER_HEIGHTS[(id * 3) % PAPER_HEIGHTS.length]}rem`,
  };
}

/** 钉子偶尔钉偏一点，不是每张都正中 */
function pinOf(id: number): number {
  return 36 + ((id * 23) % 29);
}

function PaperPin({ x = 50 }: { x?: number }) {
  return (
    <>
      <span
        aria-hidden="true"
        style={{ left: `${x}%` }}
        className="pointer-events-none absolute top-0 z-[15] h-2.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/25 blur-[3px]"
      />
      <span
        aria-hidden="true"
        style={{ left: `${x}%` }}
        className="pointer-events-none absolute top-0 z-20 h-3.5 w-3.5 -translate-x-1/2 -translate-y-[60%] rounded-full bg-[radial-gradient(circle_at_33%_28%,#fff9e8_0%,#f2dca4_20%,#cda85a_45%,#8f6b28_72%,#5a3e0f_100%)] shadow-[0_2px_3px_rgba(46,32,8,0.45),inset_0_-1px_2px_rgba(60,40,5,0.5)]"
      >
        <span className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.9),rgba(255,255,255,0)_62%)]" />
      </span>
    </>
  );
}

function PaperTexture() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-[0.22] mix-blend-multiply"
        style={{ backgroundImage: PAPER_GRAIN, backgroundSize: "160px 160px" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.06) 46%, rgba(70,52,20,0.05))",
        }}
      />
    </>
  );
}

const SKELETON_WIDTHS = [
  "w-40",
  "w-56",
  "w-44",
  "w-52",
  "w-36",
  "w-60",
  "w-48",
  "w-40",
];

function paperOf(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PAPERS[hash % PAPERS.length];
}

/** 便签上只留日期，完整时间留给详情 */
function shortTime(value: string): string {
  const match = value.match(/^\d{4}-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : value;
}

export default function MessagePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [active, setActive] = useState<Message | null>(null);

  // 表单状态
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState("");
  const [content, setContent] = useState("");

  /** 加载留言列表；silent 用于提交后刷新，避免墙面闪成骨架屏 */
  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) {
      setError("");
      setLoading(true);
    }
    try {
      const res = await api.get<Message[]>("/messages");
      if (res.flag && res.data) {
        setMessages(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 初始 loading 已经是 true；把拉取放到微任务里，避免在 effect 中同步 setState
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) return fetchMessages(true);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchMessages]);

  /** 提交留言 */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setSubmitting(true);
    setFormError("");
    try {
      const res = await api.post("/messages", {
        nickname: nickname.trim(),
        avatar: avatar.trim(),
        messageContent: content.trim(),
      });
      if (res.flag) {
        setNickname("");
        setAvatar("");
        setContent("");
        setComposerOpen(false);
        void fetchMessages(true);
      } else {
        setFormError(res.message || "提交失败，请稍后重试");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const activePaper = active ? paperOf(active.nickname) : PAPERS[0];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="sr-only">留言板</h1>

      {/* 写留言：默认是一张钉在墙上的空便签，点开后才展开表单 */}
      {!composerOpen ? (
        <div className="mb-7 flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="relative flex w-full max-w-sm rotate-[0.4deg] items-center justify-center gap-2 rounded-[5px] border border-dashed border-[#d5c4a3] bg-[#faf4e3] px-4 pt-4 pb-3 text-[12.5px] text-[#8b7d67] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_1px_rgba(50,38,15,0.08),0_10px_16px_-14px_rgba(50,38,15,0.45)] transition-[translate,box-shadow,color] duration-300 hover:-translate-y-0.5 hover:text-[#5b5140] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_3px_4px_rgba(50,38,15,0.12),0_18px_24px_-18px_rgba(50,38,15,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blog-ink/25 dark:brightness-[0.94]"
          >
            <PaperPin />
            <PaperTexture />
            <Plus className="relative z-10 h-3.5 w-3.5" />
            <span className="relative z-10">留一张便签…</span>
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-blog-line bg-blog-surface p-4"
        >
          <div className="grid gap-2.5 sm:grid-cols-[10rem_1fr]">
            <div>
              <Label htmlFor="nickname" className="sr-only">
                昵称
              </Label>
              <Input
                id="nickname"
                placeholder="昵称 *"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="avatar" className="sr-only">
                头像 URL
              </Label>
              <Input
                id="avatar"
                placeholder="头像链接（可选）"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2.5">
            <Label htmlFor="content" className="sr-only">
              留言内容
            </Label>
            <Textarea
              id="content"
              placeholder="说点什么吧…"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-[11px] text-blog-soft">
              {formError ? (
                <span className="text-rose-600 dark:text-rose-400">
                  {formError}
                </span>
              ) : (
                "昵称和内容为必填项"
              )}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setComposerOpen(false);
                  setFormError("");
                }}
              >
                取消
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "提交中…" : "贴上墙"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* 标签墙 */}
      {loading ? (
        <div
          aria-hidden="true"
          className="flex flex-wrap justify-center gap-x-3 gap-y-5 pt-2"
        >
          {SKELETON_WIDTHS.map((width, index) => (
            <Skeleton
              key={index}
              className={cn(width, "h-[74px] rounded-[5px]")}
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-[13px] text-blog-soft">
          <p>加载失败：{error}</p>
          <button
            type="button"
            onClick={() => void fetchMessages()}
            className="rounded-full border border-blog-line px-4 py-1.5 text-[12.5px] text-blog-ink transition-colors hover:bg-blog-muted"
          >
            重试
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="relative rotate-[-1deg] rounded-[5px] border border-[#dfd1b3] bg-[#faf4e3] px-7 pt-5 pb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_1px_1px_rgba(50,38,15,0.10),0_10px_18px_-12px_rgba(50,38,15,0.45)]">
            <PaperPin />
            <PaperTexture />
            <p className={cn("relative z-10 text-[12.5px]", PAPER_SOFT)}>
              还没有留言，来做第一个留言的人吧
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-6 pt-2">
          {messages.map((msg) => {
            const paper = paperOf(msg.nickname);
            const tilt = tiltOf(msg.id);
            const drop = dropOf(msg.id);
            const size = paperSizeOf(msg.id);
            const pinX = pinOf(msg.id);
            return (
              <button
                key={msg.id}
                type="button"
                onClick={() => setActive(msg)}
                aria-label={`${msg.nickname} 的留言：${msg.messageContent}`}
                style={
                  {
                    "--tilt": `${tilt}deg`,
                    marginTop: drop,
                    width: size.width,
                    minHeight: size.minHeight,
                  } as CSSProperties
                }
                className={cn(
                  "group relative flex max-w-full rotate-[var(--tilt)] flex-col gap-2 rounded-[5px] border px-3.5 pt-4 pb-3 text-left transition-[rotate,translate,box-shadow,filter] duration-300 hover:z-10 hover:-translate-y-1 hover:rotate-0 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_3px_4px_rgba(50,38,15,0.14),0_22px_30px_-18px_rgba(50,38,15,0.55)] focus-visible:rotate-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blog-ink/25 dark:brightness-[0.94]",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-1px_0_rgba(58,42,12,0.06),0_1px_1px_rgba(50,38,15,0.10),0_10px_18px_-12px_rgba(50,38,15,0.45)]",
                  paper.card,
                )}
              >
                <PaperPin x={pinX} />
                <PaperTexture />

                <span className="relative z-10 flex w-full items-center gap-1.5">
                  <Avatar className="h-4 w-4 border border-black/10">
                    {msg.avatar ? (
                      <AvatarImage src={msg.avatar} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-black/[0.06] text-[8px] text-[#5b5140]">
                      {msg.nickname.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "min-w-0 truncate text-[12px] font-medium",
                      PAPER_TEXT,
                    )}
                  >
                    {msg.nickname}
                  </span>
                  <time
                    dateTime={msg.createTime}
                    className={cn(
                      "ml-auto shrink-0 font-mono text-[10px]",
                      PAPER_SOFT,
                    )}
                  >
                    {shortTime(msg.createTime)}
                  </time>
                </span>
                <span
                  className={cn(
                    "relative z-10 line-clamp-3 break-words text-[12.5px] leading-[1.6] opacity-90",
                    PAPER_TEXT,
                  )}
                >
                  {msg.messageContent}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 留言详情 */}
      <Dialog
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent className="bg-transparent p-0 text-[#5b5140] shadow-none ring-0 sm:max-w-md">

          <DialogTitle className="sr-only">
            {active?.nickname ?? "留言"}的留言
          </DialogTitle>
          <DialogDescription className="sr-only">
            留言全文
          </DialogDescription>
          {active && (
            <div
              className={cn(
                "relative rotate-[-0.5deg] rounded-[5px] border px-5 pt-6 pb-5 pr-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-1px_0_rgba(58,42,12,0.06),0_1px_1px_rgba(50,38,15,0.10),0_14px_22px_-14px_rgba(50,38,15,0.5)] dark:brightness-[0.94]",
                activePaper.card,
              )}
            >
              <PaperPin />
              <PaperTexture />
              <div className="relative z-10 flex items-center gap-2">
                <Avatar className="h-7 w-7 border border-black/10">
                  {active.avatar ? (
                    <AvatarImage src={active.avatar} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-black/[0.06] text-[11px] text-[#5b5140]">
                    {active.nickname.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-[13px] font-medium",
                      PAPER_TEXT,
                    )}
                  >
                    {active.nickname}
                  </p>
                  <time
                    dateTime={active.createTime}
                    className={cn("font-mono text-[10.5px]", PAPER_SOFT)}
                  >
                    {active.createTime}
                  </time>
                </div>
              </div>
              <p
                className={cn(
                  "relative z-10 mt-3 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed opacity-90",
                  PAPER_TEXT,
                )}
              >
                {active.messageContent}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
