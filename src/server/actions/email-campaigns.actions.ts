"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { RATE_LIMITS } from "@/lib/constants";
import { isValidEmailFormat, normalizeEmail } from "@/lib/customer-club/normalize";
import { consumeRateLimitAsync, getRequestClientIp } from "@/lib/security/rate-limit";
import { revalidatePath } from "next/cache";
import {
  getEmailCampaignForAdmin,
  listEmailCampaigns,
  sendCustomerClubCampaign
} from "@/services/email-campaigns.service";
import type { EmailCampaign } from "@/types/email-campaign";

const paths = ["/admin/customer-club"];

export type SendClubCampaignActionInput = {
  signupIds: string[];
  manualEmails: string[];
  subject: string;
  body: string;
  clientRequestId: string;
};

export type SendClubCampaignActionResult =
  | { ok: true; campaign: EmailCampaign; reused: boolean }
  | { ok: false; error: string };

export async function getEmailCampaignsAdminData(): Promise<EmailCampaign[]> {
  await requireAdmin();
  return listEmailCampaigns();
}

export async function getEmailCampaignAdminAction(id: string): Promise<EmailCampaign | null> {
  await requireAdmin();
  return getEmailCampaignForAdmin(id);
}

export async function sendCustomerClubCampaignAction(
  input: SendClubCampaignActionInput
): Promise<SendClubCampaignActionResult> {
  const session = await requireAdmin();
  const ip = await getRequestClientIp();

  if (
    !(await consumeRateLimitAsync(
      `club-campaign:${session.email}:${ip}`,
      RATE_LIMITS.clubCampaignSend.maxAttempts,
      RATE_LIMITS.clubCampaignSend.windowMs
    ))
  ) {
    return { ok: false, error: "חרגתם ממגבלת שליחת דיוור. נסו שוב מאוחר יותר." };
  }

  const signupIds = Array.isArray(input.signupIds)
    ? [...new Set(input.signupIds.map((id) => String(id).trim()).filter(Boolean))].slice(0, 500)
    : [];

  const manualEmails = Array.isArray(input.manualEmails)
    ? [
        ...new Set(
          input.manualEmails
            .map((email) => normalizeEmail(String(email)))
            .filter((email) => email && isValidEmailFormat(email))
        )
      ].slice(0, 100)
    : [];

  if (signupIds.length === 0 && manualEmails.length === 0) {
    return { ok: false, error: "יש לבחור לפחות נמען אחד." };
  }

  try {
    const result = await sendCustomerClubCampaign({
      signupIds,
      manualEmails,
      subject: String(input.subject ?? ""),
      body: String(input.body ?? ""),
      clientRequestId: String(input.clientRequestId ?? ""),
      adminEmail: session.email
    });

    if (result.ok) {
      paths.forEach((path) => revalidatePath(path));
    }

    return result;
  } catch (error) {
    console.error(
      "[EmailCampaign] sendCustomerClubCampaignAction failed",
      error instanceof Error ? { name: error.name, message: error.message } : { raw: "error" }
    );
    return {
      ok: false,
      error: error instanceof Error ? error.message : "שליחת הדיוור נכשלה. נסו שוב."
    };
  }
}
