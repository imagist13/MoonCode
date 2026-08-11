"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSessionStore } from "@/stores/session-store";

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);

  const [form, setForm] = React.useState({
    username: "",
    email: "",
    nickname: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          nickname: form.nickname || undefined,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "注册失败");
      setSession(data.user, data.token);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-moon to-moon-glow shadow">
          <Moon className="h-5 w-5 text-night" />
        </div>
        <CardTitle className="text-xl">加入 Moon</CardTitle>
        <CardDescription>注册账号，开启月下写作</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">用户名</Label>
            <Input id="username" value={form.username} onChange={update("username")} required disabled={loading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" value={form.email} onChange={update("email")} required disabled={loading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nickname">昵称（可选）</Label>
            <Input id="nickname" value={form.nickname} onChange={update("nickname")} disabled={loading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">密码</Label>
            <Input id="password" type="password" value={form.password} onChange={update("password")} required minLength={6} disabled={loading} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">确认密码</Label>
            <Input id="confirm" type="password" value={form.confirm} onChange={update("confirm")} required minLength={6} disabled={loading} />
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            创建账号
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            已有账号？
            <Link href="/login" className="ml-1 text-primary hover:underline">
              去登录
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}