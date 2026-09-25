"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Users,
  MessageSquare,
  Eye,
  Plus,
  List,
  FolderTree,
  Tags,
  Mail,
  MessageCircle,
  Camera,
  ArrowRight,
  Bell,
  Check,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DashboardData {
  articleCount: number;
  userCount: number;
  messageCount: number;
  viewCount: number;
}

interface Notification {
  id: number;
  title: string;
  content: string;
  read: boolean;
  createTime: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    let cancelled = false;
    api
      .get<DashboardData>("/admin")
      .then((res) => {
        if (!cancelled && res.flag) setData(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 占位通知
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        title: "欢迎使用博客后台",
        content: "在这里你可以管理文章、评论、用户等所有内容",
        read: false,
        createTime: new Date().toISOString(),
      },
    ]);
  }, []);

  const stats = [
    { label: "总文章数", value: data?.articleCount ?? 0, icon: FileText },
    { label: "总用户数", value: data?.userCount ?? 0, icon: Users },
    { label: "总评论数", value: data?.messageCount ?? 0, icon: MessageSquare },
    { label: "总访问量", value: data?.viewCount ?? 0, icon: Eye },
  ];

  const quickActions = [
    { title: "发布文章", description: "写一篇新文章", icon: Plus, href: "/admin/articles/create" },
    { title: "文章列表", description: "管理现有文章", icon: List, href: "/admin/articles" },
    { title: "分类管理", description: "管理文章分类", icon: FolderTree, href: "/admin/categories" },
    { title: "标签管理", description: "管理文章标签", icon: Tags, href: "/admin/tags" },
    { title: "评论管理", description: "审核评论", icon: MessageCircle, href: "/admin/comments" },
    { title: "留言管理", description: "查看留言", icon: Mail, href: "/admin/messages" },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (tab === "unread") return !n.read;
    if (tab === "read") return n.read;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 统计卡片（spec §5.4.1） */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {loading ? "—" : stat.value}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 快捷操作（spec §5.4.2） */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          快捷操作
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {quickActions.map((a) => (
            <Link
              key={a.title}
              href={a.href}
              className="group flex items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <a.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{a.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{a.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
            </Link>
          ))}
        </div>
      </div>

      {/* 通知面板（spec §5.4.3） */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            <Bell className="h-5 w-5" />
            通知
          </h2>
          <div className="flex gap-1">
            {[
              { key: "all" as const, label: "全部" },
              { key: "unread" as const, label: "未读" },
              { key: "read" as const, label: "已读" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "rounded px-3 py-1 text-sm transition-colors",
                  tab === t.key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <li className="py-8 text-center text-sm text-gray-400">暂无通知</li>
          ) : (
            filteredNotifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "rounded-lg border border-gray-200 p-4 transition-colors",
                  n.read
                    ? "bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                    : "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {n.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{n.content}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs">
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((nn) => (nn.id === n.id ? { ...nn, read: true } : nn)),
                          );
                          toast.success("已标为已读");
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Check className="h-3 w-3" />
                        标为已读
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => prev.filter((nn) => nn.id !== n.id))
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-3 w-3" />
                      删除
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}