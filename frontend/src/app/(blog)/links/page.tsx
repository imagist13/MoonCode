"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
        <h1 className="text-3xl font-bold">友情链接</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p>加载失败: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-10 overflow-hidden rounded-2xl border border-border/60
                      bg-linear-to-br from-brand-50 via-background to-purple-50/30
                      dark:from-brand-900/20 dark:via-background dark:to-purple-900/10
                      px-6 py-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48
                        rounded-full bg-brand-400/20 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-linear-to-r from-brand-500 via-brand-600 to-purple-500
                             bg-clip-text text-transparent">
              友情链接
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            感谢各位朋友的支持
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={
              /^https?:\/\//i.test(link.linkAddress)
                ? link.linkAddress
                : /^javascript:/i.test(link.linkAddress)
                  ? "#"
                  : `https://${link.linkAddress}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="h-full">
              <CardHeader className="flex-row items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-brand-100 transition-all
                                   group-hover:ring-brand-300 group-hover:scale-105
                                   dark:ring-brand-900/40 dark:group-hover:ring-brand-700/60">
                  <AvatarImage src={link.linkAvatar} alt={link.linkName} />
                  <AvatarFallback>
                    {link.linkName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-base transition-colors
                                         group-hover:text-brand-600
                                         dark:group-hover:text-brand-400">
                    {link.linkName}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {link.linkIntro}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </a>
        ))}

        {links.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            暂无友链
          </p>
        )}
      </div>
    </div>
  );
}
