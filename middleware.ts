import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authMode = process.env.ADMIN_AUTH_MODE ?? "mock";

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Local phase: admin routes are visible while UI and data layers are developed.
  if (authMode === "mock") {
    return NextResponse.next();
  }

  const hasAdminSession = Boolean(request.cookies.get("admin_session")?.value);

  if (!hasAdminSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
