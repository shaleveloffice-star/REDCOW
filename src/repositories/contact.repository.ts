import { mockContactMessages } from "@/data/mock/contact.mock";
import type { ContactMessage } from "@/types/content";

export async function getContactMessages(): Promise<ContactMessage[]> {
  return mockContactMessages;
}

export async function saveContactMessage(input: ContactMessage): Promise<ContactMessage> {
  return input;
}
