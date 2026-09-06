import "server-only";

import { Resend } from "resend";

export type ResendFromConfig = {
  email: string;
  name: string;
  formatted: string;
};

export function getResendFromConfig(): ResendFromConfig | null {
  const email = process.env.RESEND_FROM_EMAIL?.trim();
  const name = process.env.RESEND_FROM_NAME?.trim() || "NB BURGER";
  if (!email) return null;
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

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Plain textarea body → simple HTML paragraphs for email clients.
 * Future: append unsubscribe footer + List-Unsubscribe header once tokens exist.
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
