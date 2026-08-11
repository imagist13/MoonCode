import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Wallpaper } from "@/components/layout/wallpaper";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Wallpaper />
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </div>
      <SiteFooter />
    </>
  );
}