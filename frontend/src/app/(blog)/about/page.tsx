"use client";

import { useEffect, useState } from "react";
import { getAbout, updateAbout, type AboutInfo } from "@/lib/about";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AboutSidebar } from "@/components/about/AboutSidebar";
import { AboutMain } from "@/components/about/AboutMain";
import { ToolboxShowcase } from "@/components/about/ToolboxShowcase";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 关于页（xl 起三栏，lg 两栏，更窄单栏）：
 *   ┌──────────┬──────────────────┬──────────┐
 *   │ 左栏     │ 中栏 1fr（主体） │ 右栏 340px│
 *   │ 身份卡   │ bio 正文         │ 我的三件套│
 *   │ 联系方式 │ About Me         │ 列表/卡片/│
 *   │ 技术栈   │ 成就 / 技能      │ 叠放     │
 *   └──────────┴──────────────────┴──────────┘
 *
 * - 中栏为页面主体，宽度最大；左栏与右栏 sticky 跟随中栏滚动；
 * - lg 下工具箱排在正文下方，窄屏退化为静态列表；
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
      <div className="py-20 text-center text-[13px] text-blog-soft">
        暂无关于信息
      </div>
    );
  }

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[220px_minmax(0,1fr)_340px] xl:gap-6">
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
      <ToolboxShowcase />
    </div>
  );
}
