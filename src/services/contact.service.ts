import { getContactMessages, saveContactMessage } from "@/repositories/contact.repository";
import type { ContactMessage } from "@/types/content";

export async function listContactMessages(): Promise<ContactMessage[]> {
  const messages = await getContactMessages();
  return [...messages].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function createContactMessage(
  input: Omit<ContactMessage, "id" | "createdAt" | "status">
): Promise<ContactMessage> {
  return saveContactMessage({
    ...input,
    id: `message-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "new"
  });
}
