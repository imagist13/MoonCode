import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants";

/** 后台路由鉴权：无 token 一律回登录页。 */
export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
