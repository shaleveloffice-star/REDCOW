"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  loginWithEmailPassword
} from "@/services/auth.service";

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let session = null;

  try {
    session = await loginWithEmailPassword(email, password);
  } catch (error) {
    console.error("[AdminAuth] login failed", error);
    redirect("/admin/login?error=config");
  }

  if (!session) {
    redirect("/admin/login?error=invalid");
  }

  try {
    await createAdminSessionCookie(session);
  } catch (error) {
    console.error("[AdminAuth] session cookie failed", error);
    redirect("/admin/login?error=config");
  }

  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
