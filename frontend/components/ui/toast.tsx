"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

type Listener = () => void;

// 全局 store —— 用 useSyncExternalStore 订阅，避免 setState-in-effect。
const store = {
  items: [] as ToastItem[],
  listeners: new Set<Listener>(),
};

function emit() {
  store.listeners.forEach((l) => l());
}

/** 全局 toast 调用。 */
export function toast(input: Omit<ToastItem, "id"> & { id?: string }) {
  const id = input.id ?? Math.random().toString(36).slice(2);
  const item: ToastItem = { duration: 3500, variant: "default", ...input, id };
  store.items = [...store.items, item];
  emit();
  const timer = setTimeout(() => dismiss(id), item.duration);
  return () => {
    clearTimeout(timer);
    dismiss(id);
  };
}

export function dismiss(id: string) {
  store.items = store.items.filter((i) => i.id !== id);
  emit();
}

function subscribe(listener: Listener) {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}
function getSnapshot() {
  return store.items;
}
const emptyItems: ToastItem[] = [];
function getServerSnapshot() {
  return emptyItems;
}

/** 挂载在根 layout 中的 Toaster。 */
export function Toaster() {
  const items = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-lg border p-4 shadow-lg backdrop-blur",
            t.variant === "destructive"
              ? "border-destructive/60 bg-destructive text-destructive-foreground"
              : t.variant === "success"
              ? "border-emerald-400/50 bg-emerald-500/90 text-white"
              : "border-border bg-popover text-popover-foreground"
          )}
        >
          {t.title && <div className="text-sm font-semibold">{t.title}</div>}
          {t.description && (
            <div className="text-sm opacity-90">{t.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
