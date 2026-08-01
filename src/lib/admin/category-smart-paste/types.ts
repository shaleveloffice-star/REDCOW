export type SmartPasteSection = "main" | "faq" | "cta";

export type SmartPasteMainField =
  | "name"
  | "slug"
  | "description"
  | "introduction"
  | "bottomContent";

export type SmartPasteFaqField = "faqKicker" | "faqTitle" | "faqLead";

export type SmartPasteCtaField = "ctaTitle" | "ctaBody" | "ctaButtonLabel" | "ctaButtonHref";

export type SmartPasteFieldKey =
  | SmartPasteMainField
  | SmartPasteFaqField
  | SmartPasteCtaField
  | `faqQuestion:${number}`
  | `faqAnswer:${number}`;

export type ParsedFaqItem = {
  index: number;
  question?: string;
  answer?: string;
};

export type CategorySmartPasteData = {
  name?: string;
  slug?: string;
  description?: string;
  introduction?: string;
  bottomContent?: string;
  faqKicker?: string;
  faqTitle?: string;
  faqLead?: string;
  faqItems: ParsedFaqItem[];
  ctaTitle?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  ctaButtonHref?: string;
};

export type CategorySmartPastePreview = {
  data: CategorySmartPasteData;
  foundFields: SmartPasteFieldKey[];
  unknownHeadings: string[];
  warnings: string[];
  fieldsCount: number;
  faqPairCount: number;
  ctaDetected: boolean;
  hasAnyField: boolean;
};
