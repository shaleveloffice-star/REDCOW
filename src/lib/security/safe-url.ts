/**
 * Allow relative site paths, http(s) URLs, or temporary admin data URLs
 * (data URLs are materialized to files on save).
 */
export function assertSafeHttpUrl(value: string, fieldLabel: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("data:image/")) {
    const comma = trimmed.indexOf(",");
    if (comma < 0) {
      throw new Error(`${fieldLabel}: תמונת data URL לא תקינה`);
    }
    const header = trimmed.slice(0, comma).toLowerCase();
    if (!/^data:image\/(jpeg|jpg|png|webp|gif);base64$/.test(header)) {
      throw new Error(`${fieldLabel}: תמונת data URL לא תקינה`);
    }
    if (trimmed.length > 700_000) {
      throw new Error(`${fieldLabel}: התמונה גדולה מדי`);
    }
    return trimmed;
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    if (trimmed.includes("\\") || trimmed.includes("\0")) {
      throw new Error(`${fieldLabel}: כתובת לא תקינה`);
    }
    return trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`${fieldLabel}: כתובת לא תקינה`);
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${fieldLabel}: מותר רק קישורי http/https או העלאה מהאדמין`);
  }

  return trimmed;
}
