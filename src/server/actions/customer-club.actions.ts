"use server";

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

export async function getCustomerClubAdminData() {
  return listCustomerClubSignups();
}

export async function submitCustomerClubSignupAction(
  formData: FormData
): Promise<CustomerClubSignupResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const birthDateRaw = String(formData.get("birthDate") ?? "").trim();
  const marketingConsent = formData.get("marketingConsent") === "on";

  if (!fullName) return { ok: false, code: "fullName" };
  if (!phone) return { ok: false, code: "phone" };
  if (email && !emailPattern.test(email)) return { ok: false, code: "email" };
  if (!marketingConsent) return { ok: false, code: "consent" };

  try {
    await createCustomerClubSignup({
      fullName,
      phone,
      email,
      birthDate: birthDateRaw || undefined,
      marketingConsent
    });
    return { ok: true };
  } catch {
    return { ok: false, code: "generic" };
  }
}

export async function saveCustomerClubSignupAction(input: CustomerClubSignup) {
  if (!input.fullName.trim()) throw new Error("שם נדרש");
  const saved = await upsertCustomerClubSignup({
    ...input,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    birthDate: input.birthDate?.trim() || undefined,
    marketingConsent: input.marketingConsent,
    status: input.status as RecordStatus
  });
  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deleteCustomerClubSignupAction(id: string) {
  const ok = await removeCustomerClubSignup(id);
  if (!ok) throw new Error("ההרשמה לא נמצאה");
  paths.forEach((path) => revalidatePath(path));
}
