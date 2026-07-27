import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/constants";
import { users } from "@/lib/api/users";
import type { User } from "@/types/user";

/**
 * 服务端读取当前登录会话（token + 用户资料）。
 * 未登录或 token 失效返回 null。
 */
export async function getSession(): Promise<{ token: string; user: User } | null> {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  try {
    const user = await users.profile(token);
    return { token, user };
  } catch {
    return null;
  }
}

/** 仅读取 token（不校验）。 */
export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}
