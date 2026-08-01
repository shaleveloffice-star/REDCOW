import type { MenuCategory } from "@/types/content";
import type { SeoPageFieldsInput } from "@/types/seo-content";
import { pickCategorySeoFields } from "@/lib/seo-content/admin-category-seo";

import type { CategorySmartPastePreview, ParsedFaqItem } from "./types";

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function categoryFormHasContent(
  draft: MenuCategory,
  seoFields: SeoPageFieldsInput | undefined
): boolean {
  if (draft.name.trim() || draft.slug.trim() || (draft.description ?? "").trim()) {
    return true;
  }

  if (!seoFields) return false;

  return Boolean(
    seoFields.introduction?.trim() ||
      seoFields.bottomContent?.trim() ||
      seoFields.faq?.kicker?.trim() ||
      seoFields.faq?.title?.trim() ||
      seoFields.faq?.lead?.trim() ||
      (seoFields.faq?.items?.length ?? 0) > 0 ||
      seoFields.cta?.title?.trim() ||
      seoFields.cta?.body?.trim() ||
      seoFields.cta?.buttonLabel?.trim() ||
      seoFields.cta?.buttonHref?.trim()
  );
}

/** True when parsed paste would overwrite a non-empty field that already has content. */
export function wouldOverwriteExistingContent(
  preview: CategorySmartPastePreview,
  draft: MenuCategory,
  seoFields: SeoPageFieldsInput
): boolean {
  const parsed = preview.data;

  if (parsed.name && hasText(draft.name)) return true;
  if (parsed.slug && hasText(draft.slug)) return true;
  if (parsed.description && hasText(draft.description)) return true;
  if (parsed.introduction && hasText(seoFields.introduction)) return true;
  if (parsed.bottomContent && hasText(seoFields.bottomContent)) return true;
  if (parsed.faqKicker && hasText(seoFields.faq?.kicker)) return true;
  if (parsed.faqTitle && hasText(seoFields.faq?.title)) return true;
  if (parsed.faqLead && hasText(seoFields.faq?.lead)) return true;
  if (parsed.ctaTitle && hasText(seoFields.cta?.title)) return true;
  if (parsed.ctaBody && hasText(seoFields.cta?.body)) return true;
  if (parsed.ctaButtonLabel && hasText(seoFields.cta?.buttonLabel)) return true;
  if (parsed.ctaButtonHref && hasText(seoFields.cta?.buttonHref)) return true;

  if (parsed.faqItems.length > 0) {
    for (const item of parsed.faqItems) {
      const existing = seoFields.faq?.items?.[item.index - 1];
      if (existing?.question?.trim() || existing?.answer?.trim()) {
        return true;
      }
    }
  }

  return false;
}

function mergeFaqItems(
  existing: SeoPageFieldsInput["faq"],
  parsedItems: ParsedFaqItem[]
): NonNullable<SeoPageFieldsInput["faq"]> {
  const baseItems = [...(existing?.items ?? [])];

  for (const item of parsedItems) {
    const index = item.index - 1;
    if (index < 0) continue;

    const nextItem = {
      question: item.question!.trim(),
      answer: item.answer!.trim()
    };

    if (index < baseItems.length) {
      baseItems[index] = nextItem;
    } else {
      while (baseItems.length < index) {
        baseItems.push({ question: "", answer: "" });
      }
      baseItems.push(nextItem);
    }
  }

  return {
    ...(existing ?? {}),
    items: baseItems
  };
}

export function applyCategorySmartPaste(
  preview: CategorySmartPastePreview,
  draft: MenuCategory,
  seoFields: SeoPageFieldsInput
): { draft: MenuCategory; seoFields: SeoPageFieldsInput } {
  const parsed = preview.data;

  const nextDraft = { ...draft };
  const nextSeo: SeoPageFieldsInput = {
    ...seoFields,
    faq: seoFields.faq
      ? { ...seoFields.faq, items: seoFields.faq.items?.map((item) => ({ ...item })) ?? [] }
      : undefined,
    cta: seoFields.cta ? { ...seoFields.cta } : undefined
  };

  if (parsed.name) nextDraft.name = parsed.name;
  if (parsed.slug) nextDraft.slug = parsed.slug;
  if (parsed.description) nextDraft.description = parsed.description;
  if (parsed.introduction) nextSeo.introduction = parsed.introduction;
  if (parsed.bottomContent) nextSeo.bottomContent = parsed.bottomContent;

  const faqMetaTouched = parsed.faqKicker || parsed.faqTitle || parsed.faqLead;
  const faqItemsTouched = parsed.faqItems.length > 0;

  if (faqMetaTouched || faqItemsTouched) {
    nextSeo.faq = faqItemsTouched
      ? mergeFaqItems(nextSeo.faq, parsed.faqItems)
      : { ...(nextSeo.faq ?? {}) };
    if (parsed.faqKicker) nextSeo.faq.kicker = parsed.faqKicker;
    if (parsed.faqTitle) nextSeo.faq.title = parsed.faqTitle;
    if (parsed.faqLead) nextSeo.faq.lead = parsed.faqLead;
  }

  const ctaTouched =
    parsed.ctaTitle || parsed.ctaBody || parsed.ctaButtonLabel || parsed.ctaButtonHref;

  if (ctaTouched) {
    nextSeo.cta = {
      ...(nextSeo.cta ?? {}),
      ...(parsed.ctaTitle ? { title: parsed.ctaTitle } : {}),
      ...(parsed.ctaBody ? { body: parsed.ctaBody } : {}),
      ...(parsed.ctaButtonLabel ? { buttonLabel: parsed.ctaButtonLabel } : {}),
      ...(parsed.ctaButtonHref ? { buttonHref: parsed.ctaButtonHref } : {})
    };
  }

  return { draft: nextDraft, seoFields: pickCategorySeoFields(nextSeo) };
}
