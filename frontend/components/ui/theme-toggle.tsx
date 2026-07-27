"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useMediaQuery } from "@/hooks/use-media-query";

/** 站点主题切换按钮（Sun/Moon）。 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  // 只有客户端进入注水后才能真实判断，避免 SSR 与 CSR 图标不一致。
  // 借用一次 media query hook 让组件仅在浏览器渲染真图标。
  const isBrowser = useMediaQuery("(min-width: 0px)");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="切换主题"
      onClick={toggle}
      className={className}
    >
      {isBrowser && theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
