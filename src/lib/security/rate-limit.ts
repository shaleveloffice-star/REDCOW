import { headers } from "next/headers";

import { consumePersistentRateLimit } from "@/lib/security/persistent-rate-limit";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/** In-memory fallback when persistent store is unavailable. */
export function consumeRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  existing.count += 1;
  return true;
}

/** Preferred entry point — persists buckets to disk (/tmp on Vercel, data/local locally). */
export async function consumeRateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  return consumePersistentRateLimit(key, limit, windowMs);
}

export async function getRequestClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = headerStore.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}
