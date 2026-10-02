"use client";

import { useEffect, useState } from "react";
import { getAbout, type AboutInfo } from "@/lib/about";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AboutSidebar } from "@/components/about/AboutSidebar";
import { AboutMain } from "@/components/about/AboutMain";
import { BannerUploader } from "@/components/about/BannerUploader";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 关于页：
 *   ┌────────────────────────────────────────────┐
 *   │            Hero Banner（mesh + 粒子）        │
 *   ├──────────────┬─────────────────────────────┤
 *   │  Sidebar      │  Main（About Me / Skills /  │
 *   │  - Identity  │         Bio）                │
 *   │  - 联系方式   │                              │
 *   │  - Tech Stack│                             │
 *   └──────────────┴─────────────────────────────┘
 *
 * 两栏 grid 用 -mt-16 上移，让身份卡里的 -mt-12 头像正好叠到 banner 下沿，
 * 跟 mockup 的「头像压住两块」视觉一致。
 *
 * - 公共部分（昵称、bio、tech stack 等）所有人都能看到；
 * - 头像 / Banner hover 上传、「编辑资料」按钮仅对管理员暴露。
 *
 * 注意：头像/Banner 上传后只更新本地预览，不会自动落库——落库需要
 * 管理员在「站点设置」页点击「保存」按钮（avatar/banner 已合并进表单）。
 */
export default function AboutPage() {
  const isAdmin = useIsAdmin();
  const [data, setData] = useState<AboutInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 头像 / Banner 走受控本地状态，保存时才一起写入接口
  const [avatarDraft, setAvatarDraft] = useState("");
  const [bannerDraft, setBannerDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAbout()
      .then((info) => {
        if (cancelled) return;
        setData(info);
        setAvatarDraft(info.avatar);
        setBannerDraft(info.banner);
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
      <div className="space-y-6">
        {/* Banner 骨架 */}
        <Skeleton className="h-[180px] w-full rounded-2xl md:h-[200px]" />
        {/* 两栏骨架 */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
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
    <div className="space-y-6">
      {/* Hero Banner */}
      <BannerUploader
        value={bannerDraft}
        onChange={setBannerDraft}
        editable={isAdmin}
      />

      {/* 两栏：-mt-16 让身份卡里的头像（-mt-12）正好叠到 banner 下沿 */}
      <section className="relative z-10 grid items-start gap-6 lg:-mt-16 lg:grid-cols-[280px_1fr]">
        <AboutSidebar
          data={data}
          editable={isAdmin}
          avatarValue={avatarDraft}
          onAvatarChange={setAvatarDraft}
        />
        <AboutMain data={data} />
      </section>
    </div>
  );
}