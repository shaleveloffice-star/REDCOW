import { BUSINESS } from "@/data/business";
import { readUnsubscribeToken } from "@/lib/email/unsubscribe-token";
import { unsubscribeCustomerEmail } from "@/repositories/customer-club.repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(message: string, token?: string, status = 200) {
  const safeToken = token?.replace(/[^a-zA-Z0-9_.-]/g, "");
  return new Response(`<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>הסרה מדיוור | SO WHAT</title><body style="font:20px Arial;padding:40px;max-width:600px;margin:auto;color:#111;background:#fff"><main><h1>הסרה מדיוור SO WHAT</h1><p>${message}</p>${safeToken ? `<form method="post" action="/unsubscribe"><input type="hidden" name="token" value="${safeToken}"><button style="font:inherit;padding:16px" type="submit">אישור הסרה מדיוור</button></form>` : ''}<p><a href="/">חזרה לאתר</a></p></main></body></html>`, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" } });
}

// GET never changes consent: email security scanners may visit links automatically.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  return readUnsubscribeToken(token) ? page("לחצו לאישור הפסקת הדיוור השיווקי. No login required — confirm below to unsubscribe.", token) : page(`קישור לא תקין. אפשר לפנות ל־${BUSINESS.email} להסרה.`, undefined, 400);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") ?? new URL(request.url).searchParams.get("token") ?? "");
  const email = readUnsubscribeToken(token);
  if (!email) return page("קישור לא תקין.", undefined, 400);
  try {
    await unsubscribeCustomerEmail(email);
    return page("הבקשה בוצעה. לא יישלח אליכם דיוור שיווקי נוסף. You have been unsubscribed.");
  } catch { return page(`לא הצלחנו להשלים את הבקשה. נסו שוב או פנו ל־${BUSINESS.email}.`, token, 503); }
}
