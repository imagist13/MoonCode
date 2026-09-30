"use client";

import { useAuthStore, useHydrated } from "@/stores/auth";

/**
 * 简单的「是否管理员」判断。
 *
 * 由于登录态只暴露了 userId / nickname / avatar / email 等基本信息，
 * 没有角色字段。这里采用一个保守策略：
 *   - 已登录（token 存在）即视为可编辑；
 *   - 未登录视为访客。
 *
 * 设计上 blog-go-next 是单人博客（普通用户基本不会登录管理后台），
 * 因此这个判断在实际场景中接近「只有站长能编辑」。
 *
 * 一旦后续登录接口暴露 roleLabel，可把这里的判断替换为真实角色判断。
 *
 * 实现上直接派生（derive）而非 useEffect + setState：token 是 Zustand
 * 选择器拿到的响应式值，配合 useHydrated 保证 SSR / 水合前后的稳定渲染。
 */
export function useIsAdmin(): boolean {
  const hydrated = useHydrated();
  const token = useAuthStore((s) => s.token);
  return hydrated && Boolean(token);
}