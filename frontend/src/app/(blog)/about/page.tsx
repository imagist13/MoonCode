"use client";

import { useEffect, useState } from "react";
import { getAbout, type AboutInfo } from "@/lib/about";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { AboutSidebar } from "@/components/about/AboutSidebar";
import { AboutMain } from "@/components/about/AboutMain";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 关于页：左侧个人卡片 + 右侧主内容。
 *
 * - 公共部分（头像、昵称、bio、tech stack 等）所有人都能看到；
 * - 「编辑资料」按钮和头像/Banner 的 hover 上传交互仅对管理员暴露，
 *   借 useIsAdmin hook 判断（token 存在即可编辑）。
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
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          <Skeleton className="mx-auto h-36 w-36 rounded-full" />
          <Skeleton className="mx-auto h-6 w-32" />
          <Skeleton className="mx-auto h-4 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-slate-500">暂无关于信息</div>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[280px_1fr]">
      <AboutSidebar
        data={data}
        editable={isAdmin}
        avatarValue={avatarDraft}
        onAvatarChange={setAvatarDraft}
      />
      <AboutMain
        data={data}
        editable={isAdmin}
        bannerValue={bannerDraft}
        onBannerChange={setBannerDraft}
      />
    </div>
  );
}