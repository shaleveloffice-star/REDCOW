import { mockCustomerClubSignups } from "@/data/mock/contact.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localCustomerClubSignupsStore } from "@/lib/firebase/local-stores";
import type { CustomerClubSignup } from "@/types/content";
import { mutateCollection } from "@/lib/firebase/atomic-collection";
import { normalizeEmail, normalizePhoneDigits } from "@/lib/customer-club/normalize";

/** Public repeat submissions never modify an existing identity or its consent. */
export async function registerCustomerClubSignup(input: CustomerClubSignup): Promise<CustomerClubSignup> {
  return mutateCollection("customerClubSignups", localCustomerClubSignupsStore, rows => {
    const match = rows.find(row =>
      normalizePhoneDigits(row.phone) === normalizePhoneDigits(input.phone) ||
      (Boolean(input.email) && normalizeEmail(row.email ?? "") === normalizeEmail(input.email))
    );
    return match ? { result: match } : { result: input, upserts: [input] };
  });
}

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
    collection: "customerClubSignups"
  });
  const saved = await customerClubStore.save(input);
  console.info("[CustomerClub] saveCustomerClubSignup completed", { id: saved.id });
  return saved;
}

export async function deleteCustomerClubSignup(id: string): Promise<boolean> {
  return customerClubStore.remove(id);
}
