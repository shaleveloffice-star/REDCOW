import type { Locale } from "@/i18n/config";
import { getPrivacyContent, getTermsContent, getAccessibilityContent } from "@/i18n/legal";
import type { LegalDocument } from "@/i18n/legal/types";

/** Static legal content — no runtime translation. */
export async function getLocalizedPrivacyContent(locale: Locale): Promise<LegalDocument> {
  return getPrivacyContent(locale);
}

export async function getLocalizedTermsContent(locale: Locale): Promise<LegalDocument> {
  return getTermsContent(locale);
}

export async function getLocalizedAccessibilityContent(locale: Locale): Promise<LegalDocument> {
  return getAccessibilityContent(locale);
}
