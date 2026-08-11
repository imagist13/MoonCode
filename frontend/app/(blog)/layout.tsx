import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Wallpaper } from "@/components/layout/wallpaper";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Wallpaper />
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}