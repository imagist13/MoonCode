"use client";

import * as React from "react";
import { THEME_STORAGE_KEY } from "@/lib/constants";

/**
 * ThemeProvider —— 在客户端注水前根据 localStorage / prefers-color-scheme
 * 立即在 <html> 上设置 .dark 类，避免闪烁。
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = saved ? saved === "dark" : prefersDark;
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // ignore
    }
  }, []);
  return <>{children}</>;
}

/**
 * 内联脚本：在 React 注水前立即同步主题（可选，避免闪烁）。
 * 在 layout 中通过 <Script> 或 <script dangerouslySetInnerHTML> 注入。
 */
export const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('${THEME_STORAGE_KEY}');
    var d = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (d) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;
