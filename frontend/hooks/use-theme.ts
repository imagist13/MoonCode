"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/constants";

export type Theme = "light" | "dark";

const listeners = new Set<() => void>();

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // ignore
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function writeTheme(next: Theme) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

/**
 * 读取/切换 <html> 的 dark class，持久化到 localStorage。
 * 使用 useSyncExternalStore 避免 setState-in-effect。
 */
export function useTheme() {
  const subscribe = (onStoreChange: () => void) => {
    listeners.add(onStoreChange);
    return () => listeners.delete(onStoreChange);
  };
  const getSnapshot = () => readTheme();
  const getServerSnapshot = () => "light" as Theme;

  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => writeTheme(next), []);
  const toggle = useCallback(
    () => writeTheme(theme === "dark" ? "light" : "dark"),
    [theme]
  );

  return { theme, setTheme, toggle };
}
