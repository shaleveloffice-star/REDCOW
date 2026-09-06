import {
  deleteCustomerClubSignup,
  getCustomerClubSignups,
  saveCustomerClubSignup
} from "@/repositories/customer-club.repository";
import { normalizeEmail, normalizePhoneDigits } from "@/lib/customer-club/normalize";
import type { CustomerClubSignup } from "@/types/content";

export async function listCustomerClubSignups(): Promise<CustomerClubSignup[]> {
  const signups = await getCustomerClubSignups();
  return [...signups].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export type CustomerClubSignupInput = {
  fullName: string;
  phone: string;
  email: string;
  birthDate?: string;
  marketingConsent: boolean;
};

/**
 * Create a new signup, or update an existing one matched by normalized email OR phone.
 * Always returns success-shaped save; caller should not reveal whether it was a duplicate.
 */
export async function createOrUpdateCustomerClubSignup(
  input: CustomerClubSignupInput
): Promise<CustomerClubSignup> {
  const emailNorm = normalizeEmail(input.email);
  const phoneNorm = normalizePhoneDigits(input.phone);
  const existing = await getCustomerClubSignups();

  const match = existing.find((signup) => {
    const existingEmail = normalizeEmail(signup.email ?? "");
    const existingPhone = normalizePhoneDigits(signup.phone ?? "");
    return (
      (emailNorm.length > 0 && existingEmail === emailNorm) ||
      (phoneNorm.length > 0 && existingPhone === phoneNorm)
    );
  });

  if (match) {
    return saveCustomerClubSignup({
      ...match,
      fullName: input.fullName,
      phone: input.phone.trim(),
      email: emailNorm,
      birthDate: input.birthDate ?? match.birthDate,
      marketingConsent: input.marketingConsent,
      createdAt: match.createdAt
    });
  }

  return saveCustomerClubSignup({
    fullName: input.fullName,
    phone: input.phone.trim(),
    email: emailNorm,
    birthDate: input.birthDate,
    marketingConsent: input.marketingConsent,
    id: `club-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "new"
  });
}

/** @deprecated Prefer createOrUpdateCustomerClubSignup for public signups. */
export async function createCustomerClubSignup(
  input: Omit<CustomerClubSignup, "id" | "createdAt" | "status">
): Promise<CustomerClubSignup> {
  return createOrUpdateCustomerClubSignup({
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    birthDate: input.birthDate,
    marketingConsent: input.marketingConsent
  });
}

export async function upsertCustomerClubSignup(input: CustomerClubSignup): Promise<CustomerClubSignup> {
  return saveCustomerClubSignup(input);
}

export async function removeCustomerClubSignup(id: string): Promise<boolean> {
  return deleteCustomerClubSignup(id);
}
