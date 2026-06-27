import { mockContactMessages } from "@/data/mock/contact.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localContactMessagesStore } from "@/lib/firebase/local-stores";
import type { ContactMessage } from "@/types/content";

const contactStore = createFirestoreCollectionStore(
  "contactMessages",
  localContactMessagesStore,
  mockContactMessages
);

export async function getContactMessages(): Promise<ContactMessage[]> {
  return contactStore.getAll();
}

export async function saveContactMessage(input: ContactMessage): Promise<ContactMessage> {
  return contactStore.save(input);
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  return contactStore.remove(id);
}
