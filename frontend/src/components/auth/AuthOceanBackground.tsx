"use client";

import { useEffect, useState } from "react";
import { AsciiSharks } from "@/components/leibox/ascii-sharks/AsciiSharks";

/** 鉴权页背景：字符鲨鱼与鱼群，中央叠加柔光保证表单可读 */
export function AuthOceanBackground() {
  const [height, setHeight] = useState(880);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const update = () => setHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // 跟随现有主题切换（documentElement 上的 dark 类）
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(root.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden bg-white dark:bg-black">
      <AsciiSharks
        className="block h-full w-full"
        options={{ theme, height, showComposer: false }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(ellipse 62% 58% at 50% 48%, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 38%, rgba(0,0,0,0.28) 65%, transparent 82%)"
              : "radial-gradient(ellipse 62% 58% at 50% 48%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 38%, rgba(255,255,255,0.3) 65%, transparent 82%)",
        }}
      />
    </div>
  );
}
