"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("请输入邮箱和密码");
      return;
    }

    setLoading(true);
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
        toast.error(res.message || "登录失败");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden
                    bg-linear-to-br from-brand-50 via-background to-purple-50/40
                    dark:from-brand-950/30 dark:via-background dark:to-purple-950/20
                    px-4 py-10">
      {/* 装饰光斑 */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full
                      bg-brand-400/25 blur-3xl dark:bg-brand-500/15" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-112 w-md
                      rounded-full bg-purple-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2
                      rounded-full bg-brand-500/8 blur-3xl animate-pulse" />

      <Card className="relative w-full max-w-sm border-border/60 bg-background/80 backdrop-blur-xl
                       shadow-(--shadow-card-hover)">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl
                          bg-linear-to-br from-brand-500 via-brand-600 to-purple-500
                          text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">
            <span className="bg-linear-to-r from-brand-500 via-brand-600 to-purple-500
                             bg-clip-text text-transparent">
              博客后台管理
            </span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">请登录以继续</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2
                                 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="pl-9 transition-all
                             focus-visible:border-brand-400 focus-visible:shadow-(--shadow-brand-glow)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2
                                 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pl-9 transition-all
                             focus-visible:border-brand-400 focus-visible:shadow-(--shadow-brand-glow)"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              size="lg"
            >
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
