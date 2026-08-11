import { NextResponse } from "next/server";
import { register } from "@/lib/api/users";
import { writeServerSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.username || !body?.password || !body?.email) {
    return NextResponse.json(
      { message: "用户名、邮箱和密码不能为空" },
      { status: 400 }
    );
  }
  if (String(body.password).length < 6) {
    return NextResponse.json(
      { message: "密码至少 6 位" },
      { status: 400 }
    );
  }
  try {
    const session = await register(body);
    await writeServerSession(session.token, session.user.id, {
      username: session.user.username,
      nickname: session.user.nickname,
      avatar: session.user.avatar,
      role: session.user.role,
    });
    return NextResponse.json(session);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "注册失败";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}