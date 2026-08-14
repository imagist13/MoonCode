"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-100 flex-col items-center justify-center gap-4 overflow-hidden">
      {/* 装饰光斑 */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full
                      bg-destructive/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full
                      bg-brand-400/15 blur-3xl" />

      <div className="relative">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl
                        bg-linear-to-br from-destructive/20 to-brand-500/15
                        ring-1 ring-destructive/30">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight">
          页面出错了
        </h2>
        <p className="mt-2 max-w-md text-center text-muted-foreground">
          抱歉，发生了意外错误。您可以尝试刷新页面。
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>重试</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </div>
      </div>
    </div>
  );
}
