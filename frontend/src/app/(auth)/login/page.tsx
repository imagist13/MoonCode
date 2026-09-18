"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  return (
    <LoginForm
      onSwitchToRegister={() => router.push("/register")}
      onSwitchToForgot={() => router.push("/forgot-password")}
    />
  );
}