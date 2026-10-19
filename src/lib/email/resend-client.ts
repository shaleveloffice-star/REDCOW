import "server-only";

import { Resend } from "resend";
import { CAMPAIGN_FROM_EMAIL, CAMPAIGN_FROM_NAME } from "@/lib/email/campaign-sender";

export type ResendFromConfig = {
  email: string;
  name: string;
  formatted: string;
};

export function getResendFromConfig(): ResendFromConfig {
  // Optional email override — only @sowhat.co.il. Display name stays the current brand
  // (ignore legacy RESEND_FROM_NAME values such as "NB BURGER").
  const envEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const email =
    envEmail && /@sowhat\.co\.il$/i.test(envEmail) ? envEmail : CAMPAIGN_FROM_EMAIL;
  const name = CAMPAIGN_FROM_NAME;
  return {
    email,
    name,
    formatted: `${name} <${email}>`
  };
}

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

/** Safe diagnostics — never returns the key itself. */
export function getResendRuntimeDiagnostics(): {
  hasApiKey: boolean;
  fromEmail: string;
  fromName: string;
} {
  const from = getResendFromConfig();
  return {
    hasApiKey: Boolean(process.env.RESEND_API_KEY?.trim()),
    fromEmail: from.email,
    fromName: from.name
  };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Plain textarea body → simple HTML paragraphs for email clients.
 * Campaign service appends the recipient-specific unsubscribe footer and headers.
 */
export function plainTextBodyToHtml(body: string): string {
  const trimmed = body.replace(/\r\n/g, "\n").trim();
  if (!trimmed) return "<p></p>";
  return trimmed
    .split(/\n{2,}/)
    .map((block) => {
      const lines = escapeHtml(block).replace(/\n/g, "<br />");
      return `<p style="margin:0 0 1em;line-height:1.5;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#111;">${lines}</p>`;
    })
    .join("");
}
