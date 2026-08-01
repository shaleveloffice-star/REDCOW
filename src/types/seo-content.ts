import type { Locale } from "@/i18n/config";

/** Built-in public pages with SEO body slots. */
export const SEO_PAGE_IDS = ["home", "about", "menu", "locations", "privacy", "terms"] as const;

export type SeoPageId = (typeof SEO_PAGE_IDS)[number];

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoFaqBlock = {
  kicker?: string;
  title?: string;
  lead?: string;
  items?: SeoFaqItem[];
};

export type SeoCtaBlock = {
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
};

/** Editable SEO body fields for a single page (stored values may be partial). */
export type SeoPageFieldsInput = {
  sectionTitle?: string;
  introduction?: string;
  bottomContent?: string;
  faq?: SeoFaqBlock;
  cta?: SeoCtaBlock;
  categoryIntros?: Record<string, string>;
  /** Per-category SEO body (intro/bottom/faq/cta) — stored under menu page bundle. */
  categoryPages?: Record<string, SeoPageFieldsInput>;
};

/** Resolved SEO body for a single menu category. */
export type ResolvedCategorySeoContent = {
  introduction: string;
  bottomContent: string;
  faq: Required<SeoFaqBlock> & { items: SeoFaqItem[] };
  cta: SeoCtaBlock;
};

/** Resolved page content after merging stored values with defaults. */
export type ResolvedSeoPageContent = {
  sectionTitle: string;
  introduction: string;
  introductionParagraphs: string[];
  bottomContent: string;
  bottomParagraphs: string[];
  faq: Required<SeoFaqBlock> & { items: SeoFaqItem[] };
  cta: SeoCtaBlock;
  categoryIntros: Record<string, string>;
  categoryPages: Record<string, ResolvedCategorySeoContent>;
};

export type SeoLocaleBundle = {
  pages: Partial<Record<SeoPageId, SeoPageFieldsInput>>;
  updatedAt: string;
};

export type SeoContentDocument = Partial<Record<Locale, SeoLocaleBundle>>;

export type SeoPageDefinition = {
  id: SeoPageId;
  labelHe: string;
  supportsFaq: boolean;
  supportsCta: boolean;
  supportsCategoryIntros: boolean;
  supportsSectionTitle: boolean;
};

export const SEO_PAGE_DEFINITIONS: SeoPageDefinition[] = [
  {
    id: "home",
    labelHe: "דף הבית",
    supportsFaq: true,
    supportsCta: true,
    supportsCategoryIntros: false,
    supportsSectionTitle: true
  },
  {
    id: "about",
    labelHe: "אודות",
    supportsFaq: false,
    supportsCta: true,
    supportsCategoryIntros: false,
    supportsSectionTitle: true
  },
  {
    id: "menu",
    labelHe: "תפריט",
    supportsFaq: false,
    supportsCta: true,
    supportsCategoryIntros: true,
    supportsSectionTitle: false
  },
  {
    id: "locations",
    labelHe: "מיקומים",
    supportsFaq: false,
    supportsCta: true,
    supportsCategoryIntros: false,
    supportsSectionTitle: false
  },
  {
    id: "privacy",
    labelHe: "מדיניות פרטיות",
    supportsFaq: false,
    supportsCta: false,
    supportsCategoryIntros: false,
    supportsSectionTitle: false
  },
  {
    id: "terms",
    labelHe: "תקנון",
    supportsFaq: false,
    supportsCta: false,
    supportsCategoryIntros: false,
    supportsSectionTitle: false
  }
];
