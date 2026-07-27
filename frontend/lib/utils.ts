import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 组合 className 工具：clsx + tailwind-merge。
 * 与 shadcn/ui 官方约定保持一致。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
