"use client";

import { AuthCard, LoginForm } from "@/components/forms/AuthCard";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  return (
    <AuthCard title="登录账号" subtitle="使用邮箱和密码登录">
      <LoginForm
        onSwitchToRegister={() => router.push("/register")}
        onSwitchToForgot={() => router.push("/forgot-password")}
      />
    </AuthCard>
  );
}