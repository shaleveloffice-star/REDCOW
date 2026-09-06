/**
 * Customer-club contact normalization helpers (no schema fields).
 * Display values stay on the record; normalized forms are used for validation / dedupe.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase().slice(0, MAX_EMAIL);
}

export function isValidEmailFormat(email: string): boolean {
  return email.length > 0 && email.length <= MAX_EMAIL && EMAIL_PATTERN.test(email);
}

/** Digits only; converts leading 972 → 0 for IL mobile matching. */
export function normalizePhoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("972") && digits.length >= 11) {
    digits = `0${digits.slice(3)}`;
  }
  return digits;
}

/**
 * Allows digits, spaces, hyphens, +, parentheses in input.
 * After digit extraction (+ IL normalize), requires 9–15 digits.
 */
export function isValidPhoneInput(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (!/^[0-9+\-\s()]+$/.test(trimmed)) return false;
  const digits = normalizePhoneDigits(trimmed);
  return digits.length >= 9 && digits.length <= 15;
}

/** Accepts YYYY-MM-DD (or parseable ISO date). Rejects invalid / future dates. */
export function parseOptionalBirthDate(raw: string): { ok: true; value?: string } | { ok: false } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: undefined };

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return { ok: false };

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { ok: false };
  }

  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (date.getTime() > todayUtc) {
    return { ok: false };
  }

  return { ok: true, value: trimmed };
}

export { MAX_EMAIL };
