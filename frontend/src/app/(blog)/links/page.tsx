"use client";

import { useEffect, useState } from "react";
import { LiquidLinkCard, type FriendLink } from "@/components/blog/LiquidLinkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

export default function LinksPage() {
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<FriendLink[]>("/links")
      .then((res) => {
        if (res.flag && res.data) {
          setLinks(res.data);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="mb-10 border-b border-blog-line pb-6">
          <h1 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-blog-ink md:text-[2rem]">
            友情链接
          </h1>
          <p className="mt-2 text-[13px] text-blog-soft">感谢各位朋友的支持</p>
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center py-20 text-[13px] text-blog-soft">
        <p>加载失败: {error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader title="友情链接" description="感谢各位朋友的支持" />

      {links.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-blog-soft">暂无友链</p>
      ) : (
        <ul className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <li key={link.id} className="min-w-0">
              <LiquidLinkCard link={link} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}