import { BUSINESS } from "@/data/business";
import { SITE_WORDMARK_LIGHT_SRC } from "@/data/brand-assets";
import { readUnsubscribeToken } from "@/lib/email/unsubscribe-token";
import {
  getCustomerClubSignups,
  unsubscribeCustomerEmail
} from "@/repositories/customer-club.repository";
import { normalizeEmail } from "@/lib/customer-club/normalize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageKind = "confirm" | "success" | "already" | "invalid" | "error";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function page(kind: PageKind, token?: string, status = 200) {
  const safeToken = token?.replace(/[^a-zA-Z0-9_.-]/g, "");
  const logoSrc = escapeHtml(SITE_WORDMARK_LIGHT_SRC);

  let heading = "";
  let body = "";
  let showForm = false;

  if (kind === "confirm") {
    heading = "לא מעוניינים לקבל מאיתנו עדכונים במייל?";
    body = `
      <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.72);">
        ניתן להפסיק את הדיוור בכל רגע.
      </p>`;
    showForm = Boolean(safeToken);
  } else if (kind === "success") {
    heading = "הוסרת בהצלחה";
    body = `
      <p style="margin:0 0 28px;font-size:17px;line-height:1.7;color:rgba(255,255,255,0.9);">
        הוסרת בהצלחה מרשימת הדיוור של SO WHAT. החברות שלך במועדון נשארת פעילה.
      </p>`;
  } else if (kind === "already") {
    heading = "כבר הוסרת מדיוור";
    body = `
      <p style="margin:0 0 28px;font-size:17px;line-height:1.7;color:rgba(255,255,255,0.9);">
        כבר הוסרת מרשימת הדיוור של SO WHAT. החברות שלך במועדון נשארת פעילה.
      </p>`;
  } else if (kind === "invalid") {
    heading = "קישור לא תקין";
    body = `
      <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.8);">
        קישור ההסרה אינו תקין או שפג תוקפו. אפשר לפנות ל־${escapeHtml(BUSINESS.email)} להסרה.
      </p>`;
  } else {
    heading = "משהו השתבש";
    body = `
      <p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:rgba(255,255,255,0.8);">
        לא הצלחנו להשלים את הבקשה. נסו שוב או פנו ל־${escapeHtml(BUSINESS.email)}.
      </p>`;
    showForm = Boolean(safeToken);
  }

  const form = showForm
    ? `<form method="post" action="/unsubscribe" style="margin:0 0 28px;">
        <input type="hidden" name="token" value="${safeToken}" />
        <button type="submit" style="font:inherit;font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:14px 28px;background:#ffffff;color:#000000;border:1px solid #ffffff;cursor:pointer;">
          הסרה מדיוור
        </button>
      </form>`
    : "";

  const html = `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>הסרה מדיוור | SO WHAT</title>
</head>
<body style="margin:0;padding:0;background:#000000;color:#ffffff;">
  <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
    <div style="width:100%;max-width:480px;text-align:center;">
      <img src="${logoSrc}" alt="SO WHAT" width="160" style="display:block;width:160px;max-width:50%;height:auto;margin:0 auto 36px;border:0;" />
      <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.65);">
        SO WHAT CLUB
      </p>
      <h1 style="margin:0 0 22px;font-size:24px;line-height:1.35;font-weight:700;">
        ${escapeHtml(heading)}
      </h1>
      ${body}
      ${form}
      <p style="margin:0;">
        <a href="/" style="color:rgba(255,255,255,0.7);text-decoration:underline;font-size:14px;">חזרה לאתר</a>
      </p>
    </div>
  </main>
</body>
</html>`;

  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer"
    }
  });
}

async function isAlreadyUnsubscribed(email: string): Promise<boolean> {
  const signups = await getCustomerClubSignups();
  const matching = signups.filter(
    (row) => normalizeEmail(row.email ?? "") === normalizeEmail(email)
  );
  if (!matching.length) return false;
  return matching.every((row) => Boolean(row.unsubscribedAt) || !row.marketingConsent);
}

// GET never changes consent: email security scanners may visit links automatically.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const email = readUnsubscribeToken(token);
  if (!email) return page("invalid", undefined, 400);
  try {
    if (await isAlreadyUnsubscribed(email)) return page("already");
  } catch {
    // Fall through to confirm if status lookup fails.
  }
  return page("confirm", token);
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = String(
    form?.get("token") ?? new URL(request.url).searchParams.get("token") ?? ""
  );
  const email = readUnsubscribeToken(token);
  if (!email) return page("invalid", undefined, 400);

  try {
    const result = await unsubscribeCustomerEmail(email);
    if (result.alreadyUnsubscribed) return page("already");
    return page("success");
  } catch {
    return page("error", token, 503);
  }
}
