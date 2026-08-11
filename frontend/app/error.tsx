"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-bold tracking-tight text-destructive">500</p>
      <h1 className="text-2xl font-semibold tracking-tight">一阵风把月光吹散了</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        页面渲染时出错了。你可以重试，或者回到首页稍后再来。
      </p>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className={cn(buttonVariants())}
        >
          重试
        </button>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          回到首页
        </Link>
      </div>
    </div>
  );
}