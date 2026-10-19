"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { RATE_LIMITS } from "@/lib/constants";
import {
  isValidEmailFormat,
  isValidPhoneInput,
  MAX_EMAIL,
  normalizeEmail,
  parseOptionalBirthDate
} from "@/lib/customer-club/normalize";
import { consumeRateLimitAsync, getRequestClientIp } from "@/lib/security/rate-limit";
import { revalidatePath } from "next/cache";
import { sendClubWelcomeEmailIfEligible } from "@/lib/email/club-welcome-email";
import {
  createOrUpdateCustomerClubSignup,
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
  | "birthDate"
  | "generic";

export type CustomerClubSignupResult =
  | { ok: true }
  | { ok: false; code: CustomerClubSignupErrorCode };

const MAX_NAME = 120;
const MAX_PHONE = 40;

export async function getCustomerClubAdminData() {
  await requireAdmin();
  return listCustomerClubSignups();
}

export async function submitCustomerClubSignupAction(
  formData: FormData
): Promise<CustomerClubSignupResult> {
  const ip = await getRequestClientIp();
  if (
    !(await consumeRateLimitAsync(
      `customer-club:${ip}`,
      RATE_LIMITS.customerClub.maxAttempts,
      RATE_LIMITS.customerClub.windowMs
    ))
  ) {
    return { ok: false, code: "generic" };
  }

  const fullName = String(formData.get("fullName") ?? "").trim().slice(0, MAX_NAME);
  const phoneRaw = String(formData.get("phone") ?? "").trim().slice(0, MAX_PHONE);
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const birthDateRaw = String(formData.get("birthDate") ?? "").trim().slice(0, 32);
  const marketingConsent = formData.get("marketingConsent") === "on";

  if (!fullName) return { ok: false, code: "fullName" };
  if (!isValidPhoneInput(phoneRaw)) return { ok: false, code: "phone" };
  if (email && !isValidEmailFormat(email)) return { ok: false, code: "email" };

  const birthParsed = parseOptionalBirthDate(birthDateRaw);
  if (!birthParsed.ok) return { ok: false, code: "birthDate" };

  try {
    const { signup, created } = await createOrUpdateCustomerClubSignup({
      fullName,
      phone: phoneRaw,
      email,
      birthDate: birthParsed.value,
      marketingConsent
    });
    const emailNorm = normalizeEmail(signup.email ?? "");
    console.info("[CustomerClub] submitCustomerClubSignupAction saved", {
      id: signup.id,
      created,
      formMarketingConsent: marketingConsent,
      storedMarketingConsent: signup.marketingConsent,
      hasEmail: Boolean(emailNorm),
      welcomeEmailStatus: signup.welcomeEmailStatus ?? null
    });

    // Welcome email only for brand-new signups with email + explicit marketing consent.
    // Repeat submissions must not re-send. Failures never fail membership.
    if (created) {
      try {
        const welcome = await sendClubWelcomeEmailIfEligible(signup);
        console.info("[CustomerClub] welcome email result", {
          id: signup.id,
          sent: welcome.sent,
          skipped: welcome.skipped ?? null,
          error: welcome.error ?? null
        });
      } catch (err) {
        console.error("[CustomerClub] welcome email unexpected error", {
          id: signup.id,
          error: err instanceof Error ? err.message : err
        });
      }
    } else {
      console.info("[CustomerClub] welcome email not attempted — existing member", {
        id: signup.id,
        storedMarketingConsent: signup.marketingConsent,
        welcomeEmailStatus: signup.welcomeEmailStatus ?? null
      });
    }

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
  const email = normalizeEmail(input.email ?? "");
  if (email && !isValidEmailFormat(email)) {
    throw new Error("אימייל לא תקין");
  }
  if (!isValidPhoneInput(input.phone)) {
    throw new Error("מספר טלפון לא תקין");
  }
  const birthParsed = parseOptionalBirthDate(input.birthDate ?? "");
  if (!birthParsed.ok) {
    throw new Error("תאריך לידה לא תקין");
  }

  const saved = await upsertCustomerClubSignup({
    ...input,
    fullName: input.fullName.trim().slice(0, MAX_NAME),
    phone: input.phone.trim().slice(0, MAX_PHONE),
    email: email.slice(0, MAX_EMAIL),
    birthDate: birthParsed.value,
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
