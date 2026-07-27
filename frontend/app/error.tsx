"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

/** 根错误边界。 */
export default function GlobalError({
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
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="label-mono text-muted-foreground">Error</div>
        <h1 className="mt-4 text-4xl tracking-tight">
          <span className="display-serif">Something</span> broke.
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          {error.message || "抱歉，页面加载失败。请稍后再试。"}
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => reset()}>重试</Button>
          <Button variant="outline" asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
