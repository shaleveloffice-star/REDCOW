"use server";

import { redirect } from "next/navigation";

import { RATE_LIMITS } from "@/lib/constants";
import { consumeRateLimit, getRequestClientIp } from "@/lib/security/rate-limit";
import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  loginWithEmailPassword
} from "@/services/auth.service";

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const ip = await getRequestClientIp();
  const rateKey = `admin-login:${ip}:${email.trim().toLowerCase() || "unknown"}`;

  if (
    !consumeRateLimit(
      rateKey,
      RATE_LIMITS.adminLogin.maxAttempts,
      RATE_LIMITS.adminLogin.windowMs
    )
  ) {
    redirect("/admin/login?error=invalid");
  }

  let session = null;

  try {
    session = await loginWithEmailPassword(email, password);
  } catch (error) {
    console.error("[AdminAuth] login failed", error instanceof Error ? error.message : "error");
    redirect("/admin/login?error=config");
  }

  if (!session) {
    redirect("/admin/login?error=invalid");
  }

  try {
    await createAdminSessionCookie(session);
  } catch (error) {
    console.error(
      "[AdminAuth] session cookie failed",
      error instanceof Error ? error.message : "error"
    );
    redirect("/admin/login?error=config");
  }

  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
