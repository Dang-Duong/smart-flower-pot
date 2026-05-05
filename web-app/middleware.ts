import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "sfp_token";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/detail/:path*", "/history/:path*", "/notifications/:path*", "/devices/:path*"],
};
