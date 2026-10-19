import { mockCustomerClubSignups } from "@/data/mock/contact.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localCustomerClubSignupsStore } from "@/lib/firebase/local-stores";
import type { CustomerClubSignup } from "@/types/content";
import { mutateCollection } from "@/lib/firebase/atomic-collection";
import { normalizeEmail, normalizePhoneDigits } from "@/lib/customer-club/normalize";

export type RegisterCustomerClubSignupResult = {
  signup: CustomerClubSignup;
  /** False when phone/email already existed — identity and consent are never overwritten. */
  created: boolean;
};

/** Public repeat submissions never modify an existing identity or its consent. */
export async function registerCustomerClubSignup(
  input: CustomerClubSignup
): Promise<RegisterCustomerClubSignupResult> {
  return mutateCollection<CustomerClubSignup, RegisterCustomerClubSignupResult>(
    "customerClubSignups",
    localCustomerClubSignupsStore,
    (rows) => {
      const match = rows.find(
        (row) =>
          normalizePhoneDigits(row.phone) === normalizePhoneDigits(input.phone) ||
          (Boolean(input.email) && normalizeEmail(row.email ?? "") === normalizeEmail(input.email))
      );
      return match
        ? { result: { signup: match, created: false } }
        : { result: { signup: input, created: true }, upserts: [input] };
    }
  );
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

export type UnsubscribeCustomerEmailResult = {
  matched: number;
  /** True when every matching record was already opted out. */
  alreadyUnsubscribed: boolean;
};

/** Apply opt-out atomically to every record sharing this email. Membership stays active. */
export async function unsubscribeCustomerEmail(
  email: string
): Promise<UnsubscribeCustomerEmailResult> {
  return mutateCollection("customerClubSignups", localCustomerClubSignupsStore, (rows) => {
    const matching = rows.filter(
      (row) => normalizeEmail(row.email ?? "") === normalizeEmail(email)
    );
    if (!matching.length) {
      return { result: { matched: 0, alreadyUnsubscribed: false } };
    }
    const alreadyUnsubscribed = matching.every(
      (row) => Boolean(row.unsubscribedAt) || !row.marketingConsent
    );
    const now = new Date().toISOString();
    return {
      result: { matched: matching.length, alreadyUnsubscribed },
      upserts: matching.map((row) => ({
        ...row,
        marketingConsent: false,
        unsubscribedAt: row.unsubscribedAt || now
      }))
    };
  });
}
