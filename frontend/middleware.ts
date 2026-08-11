import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/admin"];
const COOKIE = "moon-session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedRoute = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!protectedRoute) return NextResponse.next();

  const raw = req.cookies.get(COOKIE)?.value;
  if (!raw) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (!parsed?.token) throw new Error("no token");
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};