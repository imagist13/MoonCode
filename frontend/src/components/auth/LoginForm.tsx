"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { FieldInput } from "./FieldInput";
import { ErrorBar } from "./ErrorBar";
import { SwitchLink } from "./CaptchaBlock";

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

export function LoginForm({
  onSwitchToRegister,
  onSwitchToForgot,
}: {
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
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
        toast.success("已登录");
        // 按角色分流
        router.replace(res.data.userInfo.loginType === 1 ? "/admin" : "/");
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
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">登录</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">继续你的阅读与写作</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorBar message={error} onDismiss={() => setError(null)} />

        <FieldInput
          label="邮箱"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
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

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2 text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 accent-gray-900 dark:border-gray-700 dark:accent-gray-100"
            />
            <span>保持登录</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-gray-500 underline-offset-4 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-gray-100"
          >
            忘记密码？
          </Link>
        </div>

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

      <div className="border-t border-gray-100 pt-6 dark:border-gray-900">
        <SwitchLink label="还没有账户？" cta="注册" onClick={onSwitchToRegister} />
      </div>
    </div>
  );
}