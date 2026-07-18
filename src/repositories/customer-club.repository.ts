import { mockCustomerClubSignups } from "@/data/mock/contact.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localCustomerClubSignupsStore } from "@/lib/firebase/local-stores";
import type { CustomerClubSignup } from "@/types/content";

const customerClubStore = createFirestoreCollectionStore(
  "customerClubSignups",
  localCustomerClubSignupsStore,
  {
    access: "private",
    seed: mockCustomerClubSignups
  }
);

export async function getCustomerClubSignups(): Promise<CustomerClubSignup[]> {
  return customerClubStore.getAll();
}

export async function saveCustomerClubSignup(input: CustomerClubSignup): Promise<CustomerClubSignup> {
  console.info("[CustomerClub] saveCustomerClubSignup called", {
    id: input.id,
    phone: input.phone,
    collection: "customerClubSignups"
  });
  const saved = await customerClubStore.save(input);
  console.info("[CustomerClub] saveCustomerClubSignup completed", { id: saved.id });
  return saved;
}

export async function deleteCustomerClubSignup(id: string): Promise<boolean> {
  return customerClubStore.remove(id);
}
