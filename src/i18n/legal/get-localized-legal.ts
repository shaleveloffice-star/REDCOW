import "server-only";

import type { Locale } from "@/i18n/config";
import { getPrivacyContentHe } from "@/i18n/legal/privacy.he";
import { getTermsContentHe } from "@/i18n/legal/terms.he";
import type { LegalDocument } from "@/i18n/legal/types";
import { translateValueForLocale } from "@/lib/translation/translate-texts";

export async function getLocalizedPrivacyContent(locale: Locale): Promise<LegalDocument> {
  const hebrew = getPrivacyContentHe();
  if (locale === "he") {
    return hebrew;
  }

  try {
    return await translateValueForLocale(hebrew, locale);
  } catch (error) {
    console.error("[translation] Failed to localize privacy content", error);
    return hebrew;
  }
}

export async function getLocalizedTermsContent(locale: Locale): Promise<LegalDocument> {
  const hebrew = getTermsContentHe();
  if (locale === "he") {
    return hebrew;
  }

  try {
    return await translateValueForLocale(hebrew, locale);
  } catch (error) {
    console.error("[translation] Failed to localize terms content", error);
    return hebrew;
  }
}
