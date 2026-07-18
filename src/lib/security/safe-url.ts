/**
 * Allow only relative site paths or http(s) URLs — blocks javascript:/data: etc.
 */
export function assertSafeHttpUrl(value: string, fieldLabel: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
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
    throw new Error(`${fieldLabel}: מותר רק קישורי http/https`);
  }

  return trimmed;
}
