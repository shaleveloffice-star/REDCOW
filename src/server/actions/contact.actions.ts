"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { RATE_LIMITS } from "@/lib/constants";
import { consumeRateLimitAsync, getRequestClientIp } from "@/lib/security/rate-limit";
import { revalidatePath } from "next/cache";
import {
  createContactMessage,
  listContactMessages,
  removeContactMessage,
  upsertContactMessage
} from "@/services/contact.service";
import type { ContactMessage, RecordStatus } from "@/types/content";

const paths = ["/admin/contact-messages"];

export type ContactMessageErrorCode = "fullName" | "phone" | "email" | "message" | "generic";

export type ContactMessageResult = { ok: true } | { ok: false; code: ContactMessageErrorCode };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getContactMessagesAdminData() {
  await requireAdmin();
  return listContactMessages();
}

export async function submitContactMessageAction(
  formData: FormData
): Promise<ContactMessageResult> {
  const ip = await getRequestClientIp();
  if (
    !(await consumeRateLimitAsync(
      `contact:${ip}`,
      RATE_LIMITS.contact.maxAttempts,
      RATE_LIMITS.contact.windowMs
    ))
  ) {
    return { ok: false, code: "generic" };
  }

  const fullName = String(formData.get("fullName") ?? "").trim().slice(0, 120);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 40);
  const email = String(formData.get("email") ?? "").trim().slice(0, 254);
  const message = String(formData.get("message") ?? "").trim().slice(0, 5000);

  if (!fullName) return { ok: false, code: "fullName" };
  if (!phone) return { ok: false, code: "phone" };
  if (email && !emailPattern.test(email)) return { ok: false, code: "email" };
  if (!message) return { ok: false, code: "message" };

  try {
    await createContactMessage({ fullName, phone, email, message });
    return { ok: true };
  } catch (error) {
    console.error(
      "[Contact] submitContactMessageAction failed",
      error instanceof Error ? error.message : error
    );
    return { ok: false, code: "generic" };
  }
}

export async function createContactMessageAction(formData: FormData) {
  await requireAdmin();
  return createContactMessage({
    fullName: String(formData.get("fullName") ?? "").trim().slice(0, 120),
    phone: String(formData.get("phone") ?? "").trim().slice(0, 40),
    email: String(formData.get("email") ?? "").trim().slice(0, 254),
    message: String(formData.get("message") ?? "").trim().slice(0, 5000)
  });
}

export async function saveContactMessageAction(input: ContactMessage) {
  await requireAdmin();
  if (!input.fullName.trim()) throw new Error("שם נדרש");
  const saved = await upsertContactMessage({
    ...input,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    status: input.status as RecordStatus
  });
  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deleteContactMessageAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const ok = await removeContactMessage(id);
  if (!ok) throw new Error("ההודעה לא נמצאה");
  paths.forEach((path) => revalidatePath(path));
}
