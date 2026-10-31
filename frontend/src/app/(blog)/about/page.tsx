"use client";

import { useEffect, useState } from "react";
import { getAbout, updateAbout, type AboutInfo } from "@/lib/about";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AboutSidebar } from "@/components/about/AboutSidebar";
import { AboutMain } from "@/components/about/AboutMain";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 关于页（极简两栏，对齐文章页）：
 *   ┌──────────────┬─────────────────────────────┐
 *   │  左栏 300px   │  右栏（介绍 Markdown）       │
 *   │  - 身份卡     │  - bio 正文                  │
 *   │  - 联系方式   │  - About Me / 成就 / 技能     │
 *   │  - Tech Stack │                             │
 *   └──────────────┴─────────────────────────────┘
 *
 * - 左栏 sticky 跟随滚动，右栏 min-w-0 自适应；
 * - 头像 hover 上传、「编辑资料」入口仅对管理员暴露；
 * - 头像上传后立即落库（updateAbout），换完刷新也在。
 */
export default function AboutPage() {
  const isAdmin = useIsAdmin();
  const [data, setData] = useState<AboutInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 头像受控本地状态，上传后立即落库
  const [avatarDraft, setAvatarDraft] = useState("");

  // 头像上传后立即落库，实现「换完刷新也在」
  const handleAvatarChange = async (url: string) => {
    if (!data) {
      setAvatarDraft(url);
      return;
    }
    const prevAvatar = data.avatar;
    const next = { ...data, avatar: url };
    setData(next);
    setAvatarDraft(url);
    try {
      await updateAbout(next);
    } catch {
      // 落库失败回滚；错误提示已由 api 层 toast
      setData({ ...data, avatar: prevAvatar });
      setAvatarDraft(prevAvatar);
    }
  };

  useEffect(() => {
    let cancelled = false;
    getAbout()
      .then((info) => {
        if (cancelled) return;
        setData(info);
        setAvatarDraft(info.avatar);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-5">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        暂无关于信息
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[300px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <AboutSidebar
          data={data}
          editable={isAdmin}
          avatarValue={avatarDraft}
          onAvatarChange={handleAvatarChange}
        />
      </aside>
      <div className="min-w-0">
        <AboutMain data={data} />
      </div>
    </div>
  );
}
