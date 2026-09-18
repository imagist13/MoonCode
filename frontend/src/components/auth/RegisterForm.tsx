"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { FieldInput } from "./FieldInput";
import { ErrorBar } from "./ErrorBar";
import { CaptchaBlock, SwitchLink } from "./CaptchaBlock";

export function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !email.trim() || !password.trim()) {
      setError("请填写完整信息");
      return;
    }
    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    if (!captcha.trim()) {
      setError("请输入验证码");
      return;
    }
    if (!agree) {
      setError("请先同意服务条款");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/register", {
        nickname,
        username: email,
        email,
        password,
        captcha,
      });
      if (res.flag) {
        toast.success("注册成功，请登录");
        onSwitchToLogin();
      } else {
        setError(res.message || "注册失败");
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
        <h1 className="text-2xl font-semibold tracking-tight">注册</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">加入这里，开始记录</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorBar message={error} onDismiss={() => setError(null)} />

        <FieldInput
          label="昵称"
          placeholder="如何称呼你"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={loading}
          maxLength={20}
        />

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
          autoComplete="new-password"
          placeholder="至少 8 位"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <FieldInput
          label="确认密码"
          type="password"
          autoComplete="new-password"
          placeholder="再次输入"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={loading}
        />

        <CaptchaBlock value={captcha} onChange={setCaptcha} />

        <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 accent-gray-900 dark:border-gray-700 dark:accent-gray-100"
          />
          <span>
            我已阅读并同意{" "}
            <a href="#" className="text-gray-900 underline-offset-4 hover:underline dark:text-gray-100">
              服务条款
            </a>{" "}
            与{" "}
            <a href="#" className="text-gray-900 underline-offset-4 hover:underline dark:text-gray-100">
              隐私政策
            </a>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
        >
          {loading ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              注册中
            </>
          ) : (
            "注册"
          )}
        </button>
      </form>

      <div className="border-t border-gray-100 pt-6 dark:border-gray-900">
        <SwitchLink label="已有账户？" cta="登录" onClick={onSwitchToLogin} />
      </div>
    </div>
  );
}