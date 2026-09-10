import { createHash } from "crypto";
import { getAdminFirestore } from "@/lib/firebase/admin-runtime";
import { isFirebaseConfigured } from "@/lib/firebase";
import { createJsonSingleDocStore } from "@/lib/admin/json-single-doc-store";

type Bucket = { count: number; resetAt: number };
const local = createJsonSingleDocStore<Record<string, Bucket>>("rate-limits.json", {});
function consume(current: Bucket | undefined, limit: number, windowMs: number, now: number) {
  const bucket = !current || now >= current.resetAt ? { count: 0, resetAt: now + windowMs } : { ...current };
  const allowed = bucket.count < limit;
  if (allowed) bucket.count++;
  return { bucket, allowed };
}
export async function consumePersistentRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const id = createHash("sha256").update(key).digest("hex");
  if (isFirebaseConfigured()) {
    const db = await getAdminFirestore();
    if (!db) throw new Error("Firestore Admin is required for shared rate limits.");
    return db.runTransaction(async transaction => {
      const ref = db.collection("rateLimits").doc(id);
      const snapshot = await transaction.get(ref);
      const { bucket, allowed } = consume(snapshot.data() as Bucket | undefined, limit, windowMs, Date.now());
      transaction.set(ref, { ...bucket, expiresAt: new Date(bucket.resetAt) });
      return allowed;
    });
  }
  if (process.env.VERCEL === "1") throw new Error("Shared rate limit storage is not configured.");
  let allowed = false;
  await local.update(store => {
    const now = Date.now();
    const result = consume(store[id], limit, windowMs, now);
    allowed = result.allowed;
    const next = Object.fromEntries(Object.entries(store).filter(([, bucket]) => bucket.resetAt > now));
    next[id] = result.bucket;
    return next;
  });
  return allowed;
}
