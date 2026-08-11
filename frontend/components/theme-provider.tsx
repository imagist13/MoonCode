"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/ui-store";

function applyTheme(theme: "light" | "dark" | "system") {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return <>{children}</>;
}

// 防 FOUC：head 内 inline 脚本——读 localStorage 在 React 挂载前应用主题。
export const themeInitScript = `
(function () {
  try {
    var raw = localStorage.getItem('moon-theme');
    var t = 'system';
    if (raw) {
      var parsed = JSON.parse(raw);
      t = parsed && parsed.state && parsed.state.theme ? parsed.state.theme : 'system';
    }
    var isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (_) {}
})();
`.trim();
