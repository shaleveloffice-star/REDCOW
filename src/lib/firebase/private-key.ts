/**
 * Edge-safe PEM normalize for Vercel env quirks.
 * Must not import firebase-admin (Node-only) — used from middleware via auth-config.
 * Never log the key.
 */
export function normalizeFirebasePrivateKey(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }

  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  key = key.replace(/\\n/g, "\n");
  return key.length > 0 ? key : null;
}
