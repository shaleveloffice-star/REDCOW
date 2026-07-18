import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  assertAdminAllowlistConfigured,
  assertProductionAuthMode,
  getAdminAuthMode,
  getAllowedAdminEmails,
  isEmailAllowedForAdmin,
  isOpenAdminAuthMode
} from "@/lib/auth/auth-config";
import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth/admin-session";

async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(getAdminSessionCookieName())?.value;
  if (!token) {
    return null;
  }

  const session = await verifyAdminSessionToken(token);
  if (!session) {
    return null;
  }

  const allowedEmails = getAllowedAdminEmails();
  if (!isEmailAllowedForAdmin(session.email, allowedEmails)) {
    return null;
  }

  return session;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  try {
    assertProductionAuthMode();
    if (!isOpenAdminAuthMode()) {
      assertAdminAllowlistConfigured();
    }
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

  const session = await getSessionFromRequest(request);
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
    loginUrl.searchParams.set("error", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
