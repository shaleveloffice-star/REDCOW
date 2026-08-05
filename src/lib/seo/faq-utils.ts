import type { SeoFaqBlock, SeoFaqItem } from "@/types/seo-content";

export type SeoFaqContent = Required<SeoFaqBlock> & { items: SeoFaqItem[] };

export function getValidFaqItems(items: SeoFaqItem[]): SeoFaqItem[] {
  return items.filter((item) => item.question.trim() && item.answer.trim());
}

/** FAQ sections and schema render only when at least one complete Q&A pair exists. */
export function hasValidFaqItems(faq: SeoFaqContent): boolean {
  return getValidFaqItems(faq.items).length > 0;
}
