import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants";

/** 退出登录：清除 cookie 并跳回首页。 */
export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set(TOKEN_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
