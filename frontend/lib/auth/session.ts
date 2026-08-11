import { cookies } from "next/headers";

export const SESSION_COOKIE = "moon-session";

export interface ServerSession {
  token: string;
  userId: number;
}

interface CookiePayload {
  token: string;
  user: { id: number; [k: string]: unknown };
}

// 服务端从 cookie 读取会话——给 RSC 用，不依赖 zustand（持久化在 localStorage）。
export async function readServerSession(): Promise<ServerSession | null> {
  const c = await cookies();
  const raw = c.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as CookiePayload;
    if (!parsed?.token || !parsed?.user?.id) return null;
    return { token: parsed.token, userId: parsed.user.id };
  } catch {
    return null;
  }
}

export async function writeServerSession(
  token: string,
  userId: number,
  extras: Record<string, unknown> = {}
) {
  const c = await cookies();
  const value = encodeURIComponent(
    JSON.stringify({ token, user: { id: userId, ...extras } })
  );
  c.set(SESSION_COOKIE, value, {
    httpOnly: false, // 客户端 zustand 也读，便于即时同步
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearServerSession() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}