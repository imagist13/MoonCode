"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { FieldInput } from "./FieldInput";
import { ErrorBar } from "./ErrorBar";
import { SwitchLink } from "./CaptchaBlock";

export function ForgotPasswordForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("请输入邮箱");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/forgot-password", { email });
      if (res.flag) {
        setSent(true);
        toast.success("重置链接已发送");
      } else {
        setError(res.message || "发送失败");
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
        <h1 className="text-2xl font-semibold tracking-tight">找回密码</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {sent ? "请检查你的邮箱" : "输入注册邮箱，我们会发送重置链接"}
        </p>
      </header>

      {sent ? (
        <div className="space-y-5">
          <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
            如果 <span className="font-medium text-gray-900 dark:text-gray-100">{email}</span>{" "}
            已被注册，链接将在 10 分钟内到达。
          </div>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
          >
            返回登录
          </button>
        </div>
      ) : (
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

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
          >
            {loading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                发送中
              </>
            ) : (
              "发送重置链接"
            )}
          </button>
        </form>
      )}

      <div className="border-t border-gray-100 pt-6 dark:border-gray-900">
        <SwitchLink label="想起密码了？" cta="登录" onClick={onSwitchToLogin} />
      </div>
    </div>
  );
}