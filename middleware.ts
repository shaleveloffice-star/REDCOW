import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { assertEdgeProductionAuthConfig } from "@/lib/auth/edge";
import {
  getAdminSessionCookieName,
  getAdminSessionFromRequestCookie
} from "@/lib/auth/edge-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  try {
    assertEdgeProductionAuthConfig();
  } catch (error) {
    console.error(
      "[AdminAuth] middleware config blocked",
      error instanceof Error ? error.message : "error"
    );
    if (isAdminApi) {
      return NextResponse.json(
        { ok: false, error: "Admin authentication is misconfigured." },
        { status: 500 }
      );
    }
    return new NextResponse("Admin authentication is misconfigured.", { status: 500 });
  }

  const session = await getAdminSessionFromRequestCookie(
    request.cookies.get(getAdminSessionCookieName())?.value
  );

  if (isAdminApi) {
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "אין הרשאת אדמין. התחברו מחדש ל־/admin/login" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"]
};
