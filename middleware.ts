import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  assertEdgeProductionAuthConfig,
  getAdminAuthMode,
  isOpenAdminAuthMode
} from "@/lib/auth/edge";
import {
  getAdminSessionCookieName,
  getAdminSessionFromRequestCookie
} from "@/lib/auth/edge-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  try {
    assertEdgeProductionAuthConfig();
  } catch (error) {
    console.error(
      "[AdminAuth] middleware config blocked",
      error instanceof Error ? error.message : "error"
    );
    return new NextResponse("Admin authentication is misconfigured.", { status: 500 });
  }

  if (isOpenAdminAuthMode()) {
    if (pathname === "/admin/login") {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/admin";
      return NextResponse.redirect(adminUrl);
    }

    return NextResponse.next();
  }

  const session = await getAdminSessionFromRequestCookie(
    request.cookies.get(getAdminSessionCookieName())?.value
  );
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    if (session) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/admin";
      return NextResponse.redirect(adminUrl);
    }

    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  if (getAdminAuthMode() === "mock" && session.isMock !== true) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("error", "invalid_credentials");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
