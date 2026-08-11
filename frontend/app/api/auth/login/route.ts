import { NextResponse } from "next/server";
import { login } from "@/lib/api/users";
import { writeServerSession, clearServerSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.username || !body?.password) {
    return NextResponse.json(
      { message: "用户名和密码不能为空" },
      { status: 400 }
    );
  }
  try {
    const session = await login(body);
    await writeServerSession(session.token, session.user.id, {
      username: session.user.username,
      nickname: session.user.nickname,
      avatar: session.user.avatar,
      role: session.user.role,
    });
    return NextResponse.json(session);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "登录失败";
    return NextResponse.json({ message: msg }, { status: 401 });
  }
}

export async function DELETE() {
  await clearServerSession();
  return NextResponse.json({ ok: true });
}