/**
 * Edge-safe PEM normalize for Vercel / dotenv quirks.
 * Must not import firebase-admin (Node-only).
 * Never log the key value.
 */

export type PrivateKeyDiagnosis = {
  present: boolean;
  normalized: boolean;
  hasPemHeader: boolean;
  hasNewlines: boolean;
  lineCount: number;
};

function stripWrappingQuotes(value: string): string {
  let key = value.trim();
  // Strip one or two layers of quotes (dashboard / CLI paste quirks).
  for (let i = 0; i < 2; i += 1) {
    if (
      (key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))
    ) {
      key = key.slice(1, -1).trim();
    }
  }
  return key;
}

/**
 * Convert env-stored private key into a usable PEM string.
 * Handles literal `\n`, double-escaped `\\n`, CRLF, and wrapping quotes.
 */
export function normalizeFirebasePrivateKey(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }

  let key = stripWrappingQuotes(raw);
  if (!key) {
    return null;
  }

  // Repeatedly unescape until stable (handles \\n → \n → newline).
  for (let i = 0; i < 3; i += 1) {
    const next = key
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n");
    if (next === key) break;
    key = next;
  }

  key = key.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  return key.length > 0 ? key : null;
}

/** Safe shape checks — never includes key material. */
export function diagnoseFirebasePrivateKey(raw: string | undefined): PrivateKeyDiagnosis {
  const present = Boolean(raw?.trim());
  const normalized = normalizeFirebasePrivateKey(raw);
  if (!normalized) {
    return {
      present,
      normalized: false,
      hasPemHeader: false,
      hasNewlines: false,
      lineCount: 0
    };
  }

  return {
    present,
    normalized: true,
    hasPemHeader: /BEGIN (RSA )?PRIVATE KEY/.test(normalized),
    hasNewlines: normalized.includes("\n"),
    lineCount: normalized.split("\n").length
  };
}
