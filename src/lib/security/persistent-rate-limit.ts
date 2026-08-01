import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { withJsonFileLock } from "@/lib/admin/json-file-lock";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Record<string, Bucket>;

const LOCK_KEY = "rate-limits.json";
const STORE_PATH =
  process.env.VERCEL === "1"
    ? path.join("/tmp", "rate-limits.json")
    : path.join(process.cwd(), "data", "local", "rate-limits.json");

const memoryBuckets = new Map<string, Bucket>();

async function readStore(): Promise<RateLimitStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as RateLimitStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeStore(store: RateLimitStore): Promise<void> {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function consumeBucket(
  buckets: Map<string, Bucket> | RateLimitStore,
  key: string,
  limit: number,
  windowMs: number,
  now: number
): boolean {
  const existing = buckets instanceof Map ? buckets.get(key) : buckets[key];

  if (!existing || now >= existing.resetAt) {
    const next = { count: 1, resetAt: now + windowMs };
    if (buckets instanceof Map) {
      buckets.set(key, next);
    } else {
      buckets[key] = next;
    }
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  existing.count += 1;
  return true;
}

/** Durable rate limit (file on disk) — survives process restarts; best-effort on serverless. */
export async function consumePersistentRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();

  try {
    return await withJsonFileLock(LOCK_KEY, async () => {
      const store = await readStore();
      const allowed = consumeBucket(store, key, limit, windowMs, now);
      await writeStore(store);
      return allowed;
    });
  } catch (error) {
    console.warn(
      "[rate-limit] persistent store failed, using memory fallback",
      error instanceof Error ? error.message : error
    );
    return consumeBucket(memoryBuckets, key, limit, windowMs, now);
  }
}
