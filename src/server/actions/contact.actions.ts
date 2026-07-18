"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { revalidatePath } from "next/cache";
import {
  createContactMessage,
  listContactMessages,
  removeContactMessage,
  upsertContactMessage
} from "@/services/contact.service";
import type { ContactMessage, RecordStatus } from "@/types/content";

const paths = ["/admin/contact-messages"];

export async function getContactMessagesAdminData() {
  await requireAdmin();
  return listContactMessages();
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
