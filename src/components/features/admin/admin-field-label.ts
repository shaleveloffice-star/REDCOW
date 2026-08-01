/** Appends a short “where it appears on site” hint for admin form labels. */
export function adminFieldLabel(label: string, where: string): string {
  return `${label} (${where})`;
}

export type AdminSeoFieldWhere = {
  sectionTitle?: string;
  introduction?: string;
  bottomContent?: string;
  faqLegend?: string;
  faqKicker?: string;
  faqTitle?: string;
  faqLead?: string;
  faqQuestion?: string;
  faqAnswer?: string;
  ctaLegend?: string;
  ctaTitle?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  ctaButtonHref?: string;
};

export const CATEGORY_SEO_FIELD_WHERE: AdminSeoFieldWhere = {
  introduction: "מתחת לשם הקטגוריה ב-/menu",
  bottomContent: "מתחת למנות בקטגוריה ב-/menu",
  faqLegend: "מתחת למנות בקטגוריה ב-/menu",
  faqKicker: "מתחת למנות בקטגוריה ב-/menu",
  faqTitle: "מתחת למנות בקטגוריה ב-/menu",
  faqLead: "פסקת פתיחה ל-FAQ — מתחת למנות ב-/menu",
  faqQuestion: "מתחת למנות בקטגוריה ב-/menu",
  faqAnswer: "מתחת למנות בקטגוריה ב-/menu",
  ctaLegend: "מתחת למנות בקטגוריה ב-/menu",
  ctaTitle: "מתחת למנות בקטגוריה ב-/menu",
  ctaBody: "מתחת למנות בקטגוריה ב-/menu",
  ctaButtonLabel: "מתחת למנות בקטגוריה ב-/menu",
  ctaButtonHref: "מתחת למנות בקטגוריה ב-/menu"
};
