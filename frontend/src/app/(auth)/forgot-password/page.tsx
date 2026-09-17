"use client";

import { AuthCard, ForgotPasswordForm } from "@/components/forms/AuthCard";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  return (
    <AuthCard
      title="找回密码"
      subtitle="输入注册邮箱，我们将发送重置链接"
      icon={<span className="text-xl">🔑</span>}
    >
      <ForgotPasswordForm onSwitchToLogin={() => router.push("/login")} />
    </AuthCard>
  );
}