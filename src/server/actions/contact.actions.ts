"use server";

import { createContactMessage, listContactMessages } from "@/services/contact.service";

export async function getContactMessagesAdminData() {
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
