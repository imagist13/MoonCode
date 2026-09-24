"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

interface FriendLink {
  id: number;
  linkName: string;
  linkAvatar: string;
  linkAddress: string;
  linkIntro: string;
}

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
      <div className="space-y-6">
        <div className="mb-10 border-b border-gray-200 pb-6 dark:border-gray-700">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-gray-100">
            友情链接
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            感谢各位朋友的支持
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p>加载失败: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="友情链接" description="感谢各位朋友的支持" />

      {links.length === 0 ? (
        <p className="text-center text-gray-400">暂无友链</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={
                  /^https?:\/\//i.test(link.linkAddress)
                    ? link.linkAddress
                    : /^javascript:/i.test(link.linkAddress)
                      ? "#"
                      : `https://${link.linkAddress}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800/50"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={link.linkAvatar} alt={link.linkName} />
                  <AvatarFallback>{link.linkName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-800 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-gray-100">
                    {link.linkName}
                  </div>
                  {link.linkIntro && (
                    <div className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                      {link.linkIntro}
                    </div>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}