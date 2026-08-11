import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold tracking-tight text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">
        月光没照到这里
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        你访问的页面不存在，可能它被作者偷偷藏起来了，或者还在酝酿中。
      </p>
      <Link href="/" className={cn(buttonVariants())}>
        回到首页
      </Link>
    </div>
  );
}