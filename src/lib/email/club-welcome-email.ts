import "server-only";

import { BUSINESS } from "@/data/business";
import { SITE_WORDMARK_LIGHT_SRC } from "@/data/brand-assets";
import { CANONICAL_SITE_ORIGIN } from "@/data/site-domain";
import { createUnsubscribeToken } from "@/lib/email/unsubscribe-token";
import { escapeHtml, getResendClient, getResendFromConfig } from "@/lib/email/resend-client";
import { isValidEmailFormat, normalizeEmail } from "@/lib/customer-club/normalize";
import { saveCustomerClubSignup } from "@/repositories/customer-club.repository";
import type { CustomerClubSignup } from "@/types/content";

export const CLUB_WELCOME_SUBJECT = "WELCOME TO SO WHAT CLUB 🍔";

function absoluteBrandAsset(pathWithQuery: string): string {
  const path = pathWithQuery.startsWith("http")
    ? pathWithQuery
    : `${CANONICAL_SITE_ORIGIN}${pathWithQuery.startsWith("/") ? "" : "/"}${pathWithQuery}`;
  return path;
}

export function buildClubWelcomeEmailHtml(options: {
  unsubscribeUrl: string;
  menuUrl: string;
  logoUrl: string;
}): string {
  const { unsubscribeUrl, menuUrl, logoUrl } = options;
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(CLUB_WELCOME_SUBJECT)}</title>
</head>
<body style="margin:0;padding:0;background:#000000;color:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;margin:0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
          <tr>
            <td align="center" style="padding:0 0 36px;">
              <img src="${escapeHtml(logoUrl)}" alt="SO WHAT" width="180" style="display:block;width:180px;max-width:60%;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.72);padding:0 0 18px;">
              SO WHAT CLUB
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:1.2;font-weight:700;letter-spacing:0.04em;color:#ffffff;padding:0 0 10px;">
              WELCOME TO THE CLUB.
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:1.45;color:#ffffff;padding:0 0 28px;">
              ברוכים הבאים ל־SO WHAT CLUB.
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.88);padding:0 8px 18px;">
              מעכשיו אתם חלק מהמועדון שלנו.
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.88);padding:0 8px 18px;">
              כאן תגלו ראשונים על מנות חדשות, הטבות מיוחדות ועדכונים ששווה להכיר.
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.88);padding:0 8px 36px;">
              נתראה בביס הבא.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 0 40px;">
              <a href="${escapeHtml(menuUrl)}" style="display:inline-block;background:#ffffff;color:#000000;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:14px 28px;border:1px solid #ffffff;">
                לתפריט שלנו
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.7);padding:0 0 28px;">
              SO WHAT BURGERS
            </td>
          </tr>
          <tr>
            <td align="center" style="border-top:1px solid rgba(255,255,255,0.16);padding:24px 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.55);">
              ${escapeHtml(BUSINESS.address.formatted.he)} · ${escapeHtml(BUSINESS.email)}
              <br />
              <a href="${escapeHtml(unsubscribeUrl)}" style="color:rgba(255,255,255,0.75);text-decoration:underline;">להסרה מרשימת התפוצה לחצו כאן</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildClubWelcomeEmailText(options: {
  unsubscribeUrl: string;
  menuUrl: string;
}): string {
  return [
    "WELCOME TO THE CLUB.",
    "",
    "ברוכים הבאים ל־SO WHAT CLUB.",
    "",
    "מעכשיו אתם חלק מהמועדון שלנו.",
    "",
    "כאן תגלו ראשונים על מנות חדשות, הטבות מיוחדות ועדכונים ששווה להכיר.",
    "",
    "נתראה בביס הבא.",
    "",
    "SO WHAT BURGERS",
    "",
    `לתפריט שלנו: ${options.menuUrl}`,
    "",
    `SO WHAT · ${BUSINESS.address.formatted.he}`,
    BUSINESS.email,
    `להסרה מרשימת התפוצה לחצו כאן: ${options.unsubscribeUrl}`
  ].join("\n");
}

export function shouldSendClubWelcomeEmail(signup: CustomerClubSignup): boolean {
  const email = normalizeEmail(signup.email ?? "");
  if (!email || !isValidEmailFormat(email)) return false;
  if (!signup.marketingConsent) return false;
  if (signup.unsubscribedAt) return false;
  if (signup.welcomeEmailStatus === "sent" || signup.welcomeEmailStatus === "skipped") return false;
  return true;
}

/**
 * Sends the welcome email once for a newly created signup.
 * Failures are recorded on the signup and never throw — membership already succeeded.
 */
export async function sendClubWelcomeEmailIfEligible(
  signup: CustomerClubSignup,
  options?: { force?: boolean }
): Promise<{ sent: boolean; skipped?: string; error?: string }> {
  if (!options?.force && !shouldSendClubWelcomeEmail(signup)) {
    const email = normalizeEmail(signup.email ?? "");
    const reason = !email
      ? "no-email"
      : !signup.marketingConsent
        ? "no-consent"
        : signup.unsubscribedAt
          ? "unsubscribed"
          : signup.welcomeEmailStatus === "sent"
            ? "already-sent"
            : "skipped";

    if (signup.welcomeEmailStatus !== "sent" && signup.welcomeEmailStatus !== "skipped") {
      try {
        await saveCustomerClubSignup({
          ...signup,
          welcomeEmailStatus: reason === "already-sent" ? "sent" : "skipped"
        });
      } catch {
        // ignore persistence failures for skip markers
      }
    }
    return { sent: false, skipped: reason };
  }

  const email = normalizeEmail(signup.email);
  const resend = getResendClient();
  if (!resend) {
    try {
      await saveCustomerClubSignup({
        ...signup,
        welcomeEmailStatus: "failed",
        welcomeEmailError: "RESEND_API_KEY missing"
      });
    } catch {
      // ignore
    }
    return { sent: false, error: "Resend לא מוגדר בשרת." };
  }

  let unsubscribeUrl: string;
  try {
    unsubscribeUrl = `${CANONICAL_SITE_ORIGIN}/unsubscribe?token=${createUnsubscribeToken(email)}`;
  } catch {
    try {
      await saveCustomerClubSignup({
        ...signup,
        welcomeEmailStatus: "failed",
        welcomeEmailError: "unsubscribe secret missing"
      });
    } catch {
      // ignore
    }
    return { sent: false, error: "חסר מפתח חתימה להסרה מדיוור." };
  }

  const from = getResendFromConfig();
  const menuUrl = CANONICAL_SITE_ORIGIN;
  const logoUrl = absoluteBrandAsset(SITE_WORDMARK_LIGHT_SRC);
  const html = buildClubWelcomeEmailHtml({ unsubscribeUrl, menuUrl, logoUrl });
  const text = buildClubWelcomeEmailText({ unsubscribeUrl, menuUrl });
  const idempotencyKey = `club-welcome/${signup.id}`;

  try {
    const result = await resend.emails.send(
      {
        from: `${from.name} <${from.email}>`,
        to: [email],
        subject: CLUB_WELCOME_SUBJECT,
        replyTo: BUSINESS.email,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
        },
        html,
        text
      },
      { idempotencyKey }
    );

    if (result.error) {
      await saveCustomerClubSignup({
        ...signup,
        welcomeEmailStatus: "failed",
        welcomeEmailError: result.error.message || "Resend error"
      });
      return { sent: false, error: result.error.message || "Resend error" };
    }

    await saveCustomerClubSignup({
      ...signup,
      welcomeEmailStatus: "sent",
      welcomeEmailSentAt: new Date().toISOString(),
      welcomeEmailResendId: result.data?.id,
      welcomeEmailError: undefined
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "שליחת מייל ברוכים הבאים נכשלה";
    try {
      await saveCustomerClubSignup({
        ...signup,
        welcomeEmailStatus: "failed",
        welcomeEmailError: message
      });
    } catch {
      // ignore
    }
    console.error("[CustomerClub] welcome email failed", message);
    return { sent: false, error: message };
  }
}
