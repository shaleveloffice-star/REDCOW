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
  bottomContent: "עדיין לא מוצג באתר",
  faqLegend: "עדיין לא מוצג באתר",
  faqKicker: "עדיין לא מוצג באתר",
  faqTitle: "עדיין לא מוצג באתר",
  faqLead: "עדיין לא מוצג באתר",
  faqQuestion: "עדיין לא מוצג באתר",
  faqAnswer: "עדיין לא מוצג באתר",
  ctaLegend: "עדיין לא מוצג באתר",
  ctaTitle: "עדיין לא מוצג באתר",
  ctaBody: "עדיין לא מוצג באתר",
  ctaButtonLabel: "עדיין לא מוצג באתר",
  ctaButtonHref: "עדיין לא מוצג באתר"
};
