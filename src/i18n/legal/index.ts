import type { Locale } from "@/i18n/config";
import type { LegalDocument } from "@/i18n/legal/types";
import { getAccessibilityContentEn } from "@/i18n/legal/accessibility.en";
import { getAccessibilityContentFr } from "@/i18n/legal/accessibility.fr";
import { getAccessibilityContentHe } from "@/i18n/legal/accessibility.he";
import { getPrivacyContentEn } from "@/i18n/legal/privacy.en";
import { getPrivacyContentFr } from "@/i18n/legal/privacy.fr";
import { getPrivacyContentHe } from "@/i18n/legal/privacy.he";
import { getTermsContentEn } from "@/i18n/legal/terms.en";
import { getTermsContentFr } from "@/i18n/legal/terms.fr";
import { getTermsContentHe } from "@/i18n/legal/terms.he";

export function getPrivacyContent(locale: Locale): LegalDocument {
  switch (locale) {
    case "en":
      return getPrivacyContentEn();
    case "fr":
      return getPrivacyContentFr();
    default:
      return getPrivacyContentHe();
  }
}

export function getTermsContent(locale: Locale): LegalDocument {
  switch (locale) {
    case "en":
      return getTermsContentEn();
    case "fr":
      return getTermsContentFr();
    default:
      return getTermsContentHe();
  }
}

export function getAccessibilityContent(locale: Locale): LegalDocument {
  switch (locale) {
    case "en":
      return getAccessibilityContentEn();
    case "fr":
      return getAccessibilityContentFr();
    default:
      return getAccessibilityContentHe();
  }
}
