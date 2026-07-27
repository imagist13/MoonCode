"use client";

// shadcn 兼容的 use-toast hook。实际实现委托到 components/ui/toast.tsx。
import { toast, dismiss, type ToastItem } from "@/components/ui/toast";

export type { ToastItem };
export { toast, dismiss };

/** 兼容 shadcn/ui 的 useToast() 用法：返回 { toast, dismiss } 方法。 */
export function useToast() {
  return { toast, dismiss };
}
