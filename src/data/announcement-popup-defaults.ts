import type { AnnouncementPopupConfig } from "@/types/content";

export const defaultAnnouncementPopupConfig = (): AnnouncementPopupConfig => ({
  enabled: true,
  kicker: "NB BURGER",
  title: "אנחנו מתכוננים לפתיחה",
  body: [
    "התפריט והתמונות המוצגים באתר כרגע הם להמחשה בלבד.",
    "בקרוב נעדכן כאן את התפריט הרשמי והתמונות האמיתיות של NB BURGER.",
    "שווה לעקוב — הדברים הטובים באמת בדרך."
  ].join("\n\n"),
  ctaLabel: "הבנתי",
  ctaHref: "",
  ctaOpenInNewTab: false,
  imageUrl: "",
  imageAlt: "",
  imagePosition: "none",
  delaySeconds: 0,
  dismissDays: 0,
  version: "v1",
  updatedAt: new Date(0).toISOString()
});
