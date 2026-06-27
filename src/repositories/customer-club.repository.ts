import { mockCustomerClubSignups } from "@/data/mock/contact.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localCustomerClubSignupsStore } from "@/lib/firebase/local-stores";
import type { CustomerClubSignup } from "@/types/content";

const customerClubStore = createFirestoreCollectionStore(
  "customerClubSignups",
  localCustomerClubSignupsStore,
  mockCustomerClubSignups
);

export async function getCustomerClubSignups(): Promise<CustomerClubSignup[]> {
  return customerClubStore.getAll();
}

export async function saveCustomerClubSignup(input: CustomerClubSignup): Promise<CustomerClubSignup> {
  return customerClubStore.save(input);
}

export async function deleteCustomerClubSignup(id: string): Promise<boolean> {
  return customerClubStore.remove(id);
}
