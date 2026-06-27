import {
  deleteCustomerClubSignup,
  getCustomerClubSignups,
  saveCustomerClubSignup
} from "@/repositories/customer-club.repository";
import type { CustomerClubSignup } from "@/types/content";

export async function listCustomerClubSignups(): Promise<CustomerClubSignup[]> {
  const signups = await getCustomerClubSignups();
  return [...signups].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function createCustomerClubSignup(
  input: Omit<CustomerClubSignup, "id" | "createdAt" | "status">
): Promise<CustomerClubSignup> {
  return saveCustomerClubSignup({
    ...input,
    id: `club-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "new"
  });
}

export async function upsertCustomerClubSignup(input: CustomerClubSignup): Promise<CustomerClubSignup> {
  return saveCustomerClubSignup(input);
}

export async function removeCustomerClubSignup(id: string): Promise<boolean> {
  return deleteCustomerClubSignup(id);
}
