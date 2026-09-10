import "server-only";

import { createId } from "@/lib/admin/new-id";
import {
  getResendClient,
  getResendFromConfig,
  plainTextBodyToHtml
} from "@/lib/email/resend-client";
import { isValidEmailFormat, normalizeEmail } from "@/lib/customer-club/normalize";
import {
  getEmailCampaignById,
  getEmailCampaigns,
  claimEmailCampaign,
  checkpointEmailCampaign
} from "@/repositories/email-campaigns.repository";
import { getCustomerClubSignups } from "@/repositories/customer-club.repository";
import type {
  EmailCampaign,
  EmailCampaignRecipient,
  EmailCampaignStatus
} from "@/types/email-campaign";

export async function listEmailCampaigns(): Promise<EmailCampaign[]> {
  const campaigns = await getEmailCampaigns();
  return [...campaigns].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export type SendClubCampaignInput = {
  signupIds: string[];
  manualEmails: string[];
  subject: string;
  body: string;
  clientRequestId: string;
  adminEmail: string;
};

export type SendClubCampaignResult =
  | {
      ok: true;
      campaign: EmailCampaign;
      reused: boolean;
    }
  | { ok: false; error: string };

function finalizeStatus(sent: number, failed: number, skipped: number): EmailCampaignStatus {
  if (sent > 0 && failed === 0) return "completed";
  if (sent > 0 && failed > 0) return "partial";
  if (sent === 0 && failed > 0) return "failed";
  if (sent === 0 && failed === 0 && skipped > 0) return "completed";
  return "failed";
}

export async function sendCustomerClubCampaign(
  input: SendClubCampaignInput
): Promise<SendClubCampaignResult> {
  const subject = input.subject.trim().slice(0, 200);
  const body = input.body.trim().slice(0, 50_000);
  const clientRequestId = input.clientRequestId.trim().slice(0, 120);

  if (!subject) return { ok: false, error: "נושא המייל נדרש." };
  if (!body) return { ok: false, error: "גוף ההודעה נדרש." };
  if (!clientRequestId) return { ok: false, error: "בקשת שליחה לא תקינה." };

  const existing = (await getEmailCampaigns()).find(
    (campaign) => campaign.clientRequestId === clientRequestId && campaign.createdByAdmin === input.adminEmail
  );
  if (existing) {
    if (existing.status === "sending" && (!existing.leaseExpiresAt || Date.parse(existing.leaseExpiresAt) > Date.now())) {
      return { ok: false, error: "שליחה כבר בתהליך עבור בקשה זו. המתינו לסיום." };
    }
    if (existing.status !== "sending") return { ok: true, campaign: existing, reused: true };
  }

  const from = getResendFromConfig();
  const resend = getResendClient();
  if (!from || !resend) {
    return {
      ok: false,
      error: "Resend לא מוגדר בשרת. בדקו RESEND_API_KEY / RESEND_FROM_EMAIL / RESEND_FROM_NAME."
    };
  }

  const signups = await getCustomerClubSignups();
  const signupById = new Map(signups.map((signup) => [signup.id, signup]));
  const recipients: EmailCampaignRecipient[] = [];
  const seenEmails = new Set<string>();
  const suppressedEmails = new Set(signups.filter(signup => !signup.marketingConsent || signup.unsubscribedAt).map(signup => normalizeEmail(signup.email ?? "")));

  for (const id of input.signupIds) {
    const signup = signupById.get(id);
    if (!signup) continue;
    const email = normalizeEmail(signup.email ?? "");
    if (!email || !isValidEmailFormat(email)) {
      recipients.push({
        email: email || "(חסר)",
        signupId: signup.id,
        source: "club",
        status: "skipped",
        error: "חסר אימייל תקין"
      });
      continue;
    }
    if (suppressedEmails.has(email)) {
      recipients.push({
        email,
        signupId: signup.id,
        source: "club",
        status: "skipped",
        error: signup.unsubscribedAt ? "בוטלה הרשמה לדיוור" : "אין הסכמה לדיוור"
      });
      continue;
    }
    if (seenEmails.has(email)) continue;
    seenEmails.add(email);
    recipients.push({
      email,
      signupId: signup.id,
      source: "club",
      status: "pending"
    });
  }

  for (const raw of input.manualEmails) {
    const email = normalizeEmail(raw);
    if (suppressedEmails.has(email)) {
      recipients.push({ email, source: "manual", status: "skipped", error: "אין הרשאה לדיוור לכתובת זו" });
      continue;
    }
    if (!email || !isValidEmailFormat(email)) {
      recipients.push({
        email: email || raw.trim() || "(לא תקין)",
        source: "manual",
        status: "skipped",
        error: "אימייל ידני לא תקין"
      });
      continue;
    }
    if (seenEmails.has(email)) continue;
    seenEmails.add(email);
    recipients.push({
      email,
      source: "manual",
      status: "pending"
    });
  }

  const toSend = recipients.filter((recipient) => recipient.status === "pending");
  if (toSend.length === 0 && !existing) {
    return { ok: false, error: "אין נמענים תקינים לשליחה." };
  }

  const now = new Date().toISOString();
  const campaignId = createId("campaign");
  let campaign: EmailCampaign = {
    id: campaignId,
    subject,
    body,
    createdAt: now,
    fromEmail: from.email,
    fromName: from.name,
    createdByAdmin: input.adminEmail,
    status: "sending",
    selectedCount: recipients.length,
    sentCount: 0,
    failedCount: 0,
    skippedCount: recipients.filter((r) => r.status === "skipped").length,
    recipients,
    clientRequestId,
    leaseToken: createId("lease"),
    leaseExpiresAt: new Date(Date.now() + 120_000).toISOString()
  };

  const claim = await claimEmailCampaign(campaign);
  if (!claim.acquired) {
    return claim.campaign.status === "sending"
      ? { ok: false, error: "שליחה כבר בתהליך עבור בקשה זו. המתינו לסיום." }
      : { ok: true, campaign: claim.campaign, reused: true };
  }
  campaign = claim.campaign;

  const html = plainTextBodyToHtml(campaign.body);
  const updatedRecipients = [...campaign.recipients];

  for (let i = 0; i < updatedRecipients.length; i += 1) {
    const recipient = updatedRecipients[i];
    if (recipient.status !== "pending") continue;

    if (suppressedEmails.has(recipient.email)) {
      updatedRecipients[i] = { ...recipient, status: "skipped", error: "אין הרשאה לדיוור לכתובת זו" };
      campaign = await checkpointEmailCampaign({ ...campaign, recipients: updatedRecipients });
      continue;
    }
    // Never replay an uncertain delivery beyond the provider's idempotency window.
    if (recipient.attemptedAt && Date.now() - Date.parse(recipient.attemptedAt) >= 23 * 60 * 60 * 1000) {
      updatedRecipients[i] = { ...recipient, status: "failed", error: "תוצאת שליחה קודמת אינה ודאית. נדרשת בדיקה בהיסטוריית ספק הדיוור לפני שליחה נוספת." };
      campaign = await checkpointEmailCampaign({ ...campaign, recipients: updatedRecipients });
      continue;
    }
    updatedRecipients[i] = { ...recipient, attemptedAt: recipient.attemptedAt ?? new Date().toISOString() };
    campaign = await checkpointEmailCampaign({ ...campaign, recipients: updatedRecipients });

    try {
      const result = await resend.emails.send({
        from: `${campaign.fromName} <${campaign.fromEmail}>`,
        to: [recipient.email],
        subject: campaign.subject,
        html,
        text: campaign.body
      }, { idempotencyKey: `${campaign.id}/${i}` });

      if (result.error) {
        updatedRecipients[i] = {
          email: recipient.email,
          signupId: recipient.signupId,
          source: recipient.source,
          status: "failed",
          error: result.error.message || "Resend error",
          sentAt: new Date().toISOString()
        };
      } else {
        const messageId = result.data?.id;
        updatedRecipients[i] = {
          email: recipient.email,
          signupId: recipient.signupId,
          source: recipient.source,
          status: "sent",
          sentAt: new Date().toISOString(),
          ...(messageId ? { resendMessageId: messageId } : {})
        };
      }
    } catch (err) {
      updatedRecipients[i] = {
        email: recipient.email,
        signupId: recipient.signupId,
        source: recipient.source,
        status: "failed",
        error: err instanceof Error ? err.message : "שליחה נכשלה",
        sentAt: new Date().toISOString()
      };
    }
    campaign = await checkpointEmailCampaign({ ...campaign, recipients: updatedRecipients });
  }

  const sentCount = updatedRecipients.filter((r) => r.status === "sent").length;
  const failedCount = updatedRecipients.filter((r) => r.status === "failed").length;
  const skippedCount = updatedRecipients.filter((r) => r.status === "skipped").length;

  campaign = await checkpointEmailCampaign({
    ...campaign,
    recipients: updatedRecipients,
    sentAt: new Date().toISOString(),
    sentCount,
    failedCount,
    skippedCount,
    selectedCount: updatedRecipients.length,
    status: finalizeStatus(sentCount, failedCount, skippedCount)
  });

  return { ok: true, campaign, reused: false };
}

export async function getEmailCampaignForAdmin(id: string): Promise<EmailCampaign | null> {
  return getEmailCampaignById(id);
}
