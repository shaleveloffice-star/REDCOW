import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

function signature(payload: string): string {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET?.trim() || process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) throw new Error("Unsubscribe signing secret is not configured");
  return createHmac("sha256", secret).update(`email-unsubscribe:v1:${payload}`).digest("base64url");
}

export function createUnsubscribeToken(email: string): string {
  const payload = Buffer.from(email.trim().toLowerCase()).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function readUnsubscribeToken(token: string): string | null {
  if (token.length > 1024) return null;
  const [payload, supplied, extra] = token.split(".");
  if (!payload || !supplied || extra) return null;
  try {
    const expected = Buffer.from(signature(payload));
    const actual = Buffer.from(supplied);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const email = Buffer.from(payload, "base64url").toString();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
  } catch { return null; }
}
