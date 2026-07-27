import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

/** 404 页。 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="label-mono text-muted-foreground">404 · Not Found</div>
        <h1 className="mt-4 text-5xl tracking-tight">
          <span className="display-serif">Nothing</span> here.
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          你走到了地图的边缘。也许这条路径尚未生成，也许它属于另一个宇宙。
        </p>
        <Button asChild className="mt-6">
          <Link href="/">返回首页</Link>
        </Button>
      </main>
      <SiteFooter />
    </>
  );
}
