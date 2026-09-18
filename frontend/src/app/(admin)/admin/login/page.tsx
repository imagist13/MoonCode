"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { FieldInput } from "@/components/auth/FieldInput";
import { ErrorBar } from "@/components/auth/ErrorBar";

interface LoginResponse {
  token: string;
  userInfo: {
    userId: number;
    nickname: string;
    avatar: string;
    intro: string;
    email: string;
    loginType: number;
  };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("请输入邮箱和密码");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post<LoginResponse>("/login", {
        username: email,
        password,
      });
      if (res.flag) {
        setAuth(res.data.token, res.data.userInfo);
        toast.success("登录成功");
        router.replace("/admin");
      } else {
        setError(res.message || "登录失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="flex h-16 items-center justify-between px-6">
        <Link
          href="/"
          className="text-base font-medium tracking-tight text-gray-900 transition-opacity hover:opacity-60 dark:text-gray-100"
        >
          ← 返回首页
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-6 pb-16 pt-12 sm:pt-24">
        <div className="w-full max-w-[360px] space-y-8">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">后台管理登录</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">仅限管理员访问</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <ErrorBar message={error} onDismiss={() => setError(null)} />

            <FieldInput
              label="邮箱"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <FieldInput
              label="密码"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
            >
              {loading ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  登录中
                </>
              ) : (
                "登录"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
