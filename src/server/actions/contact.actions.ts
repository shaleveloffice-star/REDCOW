"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
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
  return createContactMessage({
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? "")
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
  await requireAdmin();
  const ok = await removeContactMessage(id);
  if (!ok) throw new Error("ההודעה לא נמצאה");
  paths.forEach((path) => revalidatePath(path));
}
