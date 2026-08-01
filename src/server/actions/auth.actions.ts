"use server";

import { redirect } from "next/navigation";

import { logAdminAuthEnvDiagnostics, type AdminAuthFailureCode } from "@/lib/auth/auth-config";
import { RATE_LIMITS } from "@/lib/constants";
import { consumeRateLimitAsync, getRequestClientIp } from "@/lib/security/rate-limit";
import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  loginWithAdminPassword
} from "@/services/auth.service";

function redirectLoginError(code: AdminAuthFailureCode): never {
  redirect(`/admin/login?error=${code}`);
}

export async function loginAdminAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  const ip = await getRequestClientIp();
  if (
    !(await consumeRateLimitAsync(
      `admin-login:${ip}`,
      RATE_LIMITS.adminLogin.maxAttempts,
      RATE_LIMITS.adminLogin.windowMs
    ))
  ) {
    redirectLoginError("rate_limited");
  }

  let result;
  try {
    result = await loginWithAdminPassword(password);
  } catch (error) {
    console.error(
      "[AdminAuth] login threw",
      error instanceof Error ? error.message : "error"
    );
    logAdminAuthEnvDiagnostics("login threw");
    redirectLoginError("config_error");
  }

  if (!result.ok) {
    if (result.code === "config_error") {
      logAdminAuthEnvDiagnostics("login result config_error");
    }
    redirectLoginError(result.code);
  }

  try {
    await createAdminSessionCookie(result.session);
  } catch (error) {
    console.error(
      "[AdminAuth] session cookie failed",
      error instanceof Error ? error.message : "error"
    );
    logAdminAuthEnvDiagnostics("session cookie failed");
    redirectLoginError("config_error");
  }

  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
