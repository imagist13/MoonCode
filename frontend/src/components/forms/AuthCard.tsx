"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Mail, Lock, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

/** 通用鉴权卡片（spec §4.10） */
export function AuthCard({
  title,
  subtitle,
  icon = <Sparkles className="h-6 w-6" />,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md space-y-8">
      {/* 图标头 */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-400 text-white shadow-md">
          {icon}
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>

      {/* 表单卡 */}
      <div className="rounded-lg bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
        {children}
      </div>

      {footer && <div className="text-center text-sm">{footer}</div>}
    </div>
  );
}

/** 表单错误条（spec §4.10） */
export function ErrorBar({ message, onClose }: { message: string; onClose?: () => void }) {
  if (!message) return null;
  return (
    <div className="form-error-bar mb-4 flex items-center justify-between">
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-xs underline"
        >
          关闭
        </button>
      )}
    </div>
  );
}

/** 验证码块（spec §4.10） */
export function CaptchaBlock({
  value,
  onChange,
  onRefresh,
  captchaUrl,
}: {
  value: string;
  onChange: (v: string) => void;
  onRefresh: () => void;
  captchaUrl?: string;
}) {
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="验证码"
        className="flex-1"
      />
      <button
        type="button"
        onClick={onRefresh}
        className="flex h-10 w-24 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-300 bg-white text-xs text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
        title="点击刷新"
      >
        {captchaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={captchaUrl}
            alt="验证码"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="inline-flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            刷新
          </span>
        )}
      </button>
    </div>
  );
}

/** 登录表单 */
export function LoginForm({
  onSwitchToRegister,
  onSwitchToForgot,
}: {
  onSwitchToRegister?: () => void;
  onSwitchToForgot?: () => void;
}) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("请输入邮箱和密码");
      setTimeout(() => setError(""), 5000);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ token: string; userInfo: unknown }>("/login", {
        username: email,
        password,
      });
      if (res.flag) {
        setAuth(res.data.token, res.data.userInfo as never);
        toast.success("登录成功");
        router.replace("/admin");
      } else {
        setError(res.message || "登录失败");
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBar message={error} onClose={() => setError("")} />

      <div>
        <Label htmlFor="email">邮箱</Label>
        <div className="relative mt-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password">密码</Label>
        <div className="relative mt-1">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            className="pl-9"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center bg-blue-600 hover:bg-blue-700"
      >
        {loading && (
          <svg
            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z" />
          </svg>
        )}
        {loading ? "登录中..." : "登录"}
      </Button>

      <div className="mt-2 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          注册账号
        </button>
        <button
          type="button"
          onClick={onSwitchToForgot}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          忘记密码？
        </button>
      </div>
    </form>
  );
}

/** 注册表单 */
export function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("请填写完整信息");
      setTimeout(() => setError(""), 5000);
      return;
    }
    if (password !== confirmPwd) {
      setError("两次密码不一致");
      setTimeout(() => setError(""), 5000);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/register", { email, password, code });
      if (res.flag) {
        toast.success("注册成功，请登录");
        onSwitchToLogin?.();
      } else {
        setError(res.message || "注册失败");
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBar message={error} onClose={() => setError("")} />

      <div>
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="至少 6 位"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="confirm">确认密码</Label>
        <Input
          id="confirm"
          type="password"
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
          placeholder="再次输入"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="code">验证码</Label>
        <CaptchaBlock
          value={code}
          onChange={setCode}
          onRefresh={() => toast.info("验证码刷新（开发中）")}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {loading ? "注册中..." : "注册"}
      </Button>

      <div className="mt-2 text-center text-sm">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          已有账号？登录
        </button>
      </div>
    </form>
  );
}

/** 找回密码 */
export function ForgotPasswordForm({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("请输入注册邮箱");
      setTimeout(() => setError(""), 5000);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/forgot-password", { email });
      if (res.flag) setSent(true);
      else {
        setError(res.message || "发送失败");
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center text-sm text-green-600">
        重置链接已发送至 {email}，请查收邮箱
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBar message={error} onClose={() => setError("")} />

      <div>
        <Label htmlFor="email">注册邮箱</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {loading ? "发送中..." : "发送重置链接"}
      </Button>

      <div className="mt-2 text-center text-sm">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          返回登录
        </button>
      </div>
    </form>
  );
}