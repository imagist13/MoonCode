"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { users } from "@/lib/api/users";
import { TOKEN_COOKIE } from "@/lib/constants";

const schema = z.object({
  username: z.string().min(3, "至少 3 个字符"),
  password: z.string().min(6, "至少 6 个字符"),
});
type FormData = z.infer<typeof schema>;

/** 浏览器端写 cookie（用函数抽离，避免 ESLint react-hooks/immutability 误报）。 */
function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await users.login(data);
      // 简化：直接写入 cookie，middleware 与 SSR 均可读。
      // 生产环境建议改由 Route Handler 写 HttpOnly cookie。
      writeCookie(TOKEN_COOKIE, result.token, 60 * 60 * 24 * 7);
      toast({ title: "登录成功", variant: "success" });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast({
        title: "登录失败",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          <span className="display-serif">Sign</span> in
        </CardTitle>
        <CardDescription>使用你的 Moon 账号登录后台。</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              autoComplete="username"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "登录中…" : "登录"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            还没有账号？{" "}
            <Link href="/register" className="text-foreground hover:underline">
              注册
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
