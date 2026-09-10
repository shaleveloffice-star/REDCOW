import {
  deleteCustomerClubSignup,
  getCustomerClubSignups,
  saveCustomerClubSignup,
  registerCustomerClubSignup
} from "@/repositories/customer-club.repository";
import { normalizeEmail } from "@/lib/customer-club/normalize";
import { createId } from "@/lib/admin/new-id";
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
 * Create a signup or acknowledge a repeat submission without modifying its owner.
 * Always returns success-shaped save; caller should not reveal whether it was a duplicate.
 */
export async function createOrUpdateCustomerClubSignup(
  input: CustomerClubSignupInput
): Promise<CustomerClubSignup> {
  const emailNorm = normalizeEmail(input.email);
  return registerCustomerClubSignup({
    fullName: input.fullName,
    phone: input.phone.trim(),
    email: emailNorm,
    birthDate: input.birthDate,
    marketingConsent: input.marketingConsent,
    id: createId("club"),
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
