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
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";

interface DashboardData {
  articleCount: number;
  userCount: number;
  messageCount: number;
  viewCount: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      {/* 统计卡片（spec §5.4.1） */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-800/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {loading ? "—" : stat.value}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600 transition-transform duration-200 group-hover:scale-110 dark:bg-blue-900/30 dark:text-blue-400">
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
              className="group flex items-start gap-3 rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-gray-50 hover:shadow-sm dark:border-gray-700 dark:hover:border-blue-800/50 dark:hover:bg-gray-700"
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
    </div>
  );
}