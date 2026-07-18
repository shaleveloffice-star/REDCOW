"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { RATE_LIMITS } from "@/lib/constants";
import { consumeRateLimit, getRequestClientIp } from "@/lib/security/rate-limit";
import { revalidatePath } from "next/cache";
import {
  createCustomerClubSignup,
  listCustomerClubSignups,
  removeCustomerClubSignup,
  upsertCustomerClubSignup
} from "@/services/customer-club.service";
import type { CustomerClubSignup, RecordStatus } from "@/types/content";

const paths = ["/admin/customer-club"];

export type CustomerClubSignupErrorCode =
  | "fullName"
  | "phone"
  | "email"
  | "consent"
  | "generic";

export type CustomerClubSignupResult =
  | { ok: true }
  | { ok: false; code: CustomerClubSignupErrorCode };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 120;
const MAX_PHONE = 40;
const MAX_EMAIL = 254;

export async function getCustomerClubAdminData() {
  await requireAdmin();
  return listCustomerClubSignups();
}

export async function submitCustomerClubSignupAction(
  formData: FormData
): Promise<CustomerClubSignupResult> {
  const ip = await getRequestClientIp();
  if (
    !consumeRateLimit(
      `customer-club:${ip}`,
      RATE_LIMITS.customerClub.maxAttempts,
      RATE_LIMITS.customerClub.windowMs
    )
  ) {
    return { ok: false, code: "generic" };
  }

  const fullName = String(formData.get("fullName") ?? "").trim().slice(0, MAX_NAME);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, MAX_PHONE);
  const email = String(formData.get("email") ?? "").trim().slice(0, MAX_EMAIL);
  const birthDateRaw = String(formData.get("birthDate") ?? "").trim().slice(0, 32);
  const marketingConsent = formData.get("marketingConsent") === "on";

  if (!fullName) return { ok: false, code: "fullName" };
  if (!phone) return { ok: false, code: "phone" };
  if (email && !emailPattern.test(email)) return { ok: false, code: "email" };
  if (!marketingConsent) return { ok: false, code: "consent" };

  try {
    const saved = await createCustomerClubSignup({
      fullName,
      phone,
      email,
      birthDate: birthDateRaw || undefined,
      marketingConsent
    });
    console.info("[CustomerClub] submitCustomerClubSignupAction saved", { id: saved.id });
    return { ok: true };
  } catch (error) {
    console.error(
      "[CustomerClub] submitCustomerClubSignupAction failed",
      error instanceof Error ? { name: error.name, message: error.message } : { raw: "error" }
    );
    return { ok: false, code: "generic" };
  }
}

export async function saveCustomerClubSignupAction(input: CustomerClubSignup) {
  await requireAdmin();
  if (!input.fullName.trim()) throw new Error("שם נדרש");
  const saved = await upsertCustomerClubSignup({
    ...input,
    fullName: input.fullName.trim().slice(0, MAX_NAME),
    phone: input.phone.trim().slice(0, MAX_PHONE),
    email: input.email.trim().slice(0, MAX_EMAIL),
    birthDate: input.birthDate?.trim() || undefined,
    marketingConsent: input.marketingConsent,
    status: input.status as RecordStatus
  });
  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deleteCustomerClubSignupAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const ok = await removeCustomerClubSignup(id);
  if (!ok) throw new Error("ההרשמה לא נמצאה");
  paths.forEach((path) => revalidatePath(path));
}
