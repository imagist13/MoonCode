"use client";

import { AuthCard, RegisterForm } from "@/components/forms/AuthCard";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  return (
    <AuthCard title="注册账号" subtitle="创建你的博客账号">
      <RegisterForm onSwitchToLogin={() => router.push("/login")} />
    </AuthCard>
  );
}