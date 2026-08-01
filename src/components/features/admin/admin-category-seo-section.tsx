"use client";

import { useMemo, useState } from "react";

import { AdminSeoFieldsForm } from "@/components/features/admin/admin-seo-fields-form";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import {
  getDefaultCategorySeoFields,
  getStoredCategorySeoFields
} from "@/lib/seo-content/admin-category-seo";
import type { SeoContentDocument, SeoPageFieldsInput } from "@/types/seo-content";

type AdminCategorySeoSectionProps = {
  categoryId: string;
  seoDocument: SeoContentDocument;
  seoByLocale: Partial<Record<Locale, SeoPageFieldsInput>>;
  onChange: (locale: Locale, fields: SeoPageFieldsInput) => void;
};

export function AdminCategorySeoSection({
  categoryId,
  seoDocument,
  seoByLocale,
  onChange
}: AdminCategorySeoSectionProps) {
  const [locale, setLocale] = useState<Locale>("he");

  const draft = seoByLocale[locale] ?? getStoredCategorySeoFields(seoDocument, locale, categoryId);
  const defaults = useMemo(
    () => getDefaultCategorySeoFields(locale, categoryId),
    [locale, categoryId]
  );

  return (
    <fieldset className="admin-seo-fieldset">
      <legend>תוכן SEO</legend>

      <div className="admin-seo-tabs" role="tablist" aria-label="שפת תוכן SEO">
        {LOCALES.map((entry) => (
          <button
            key={entry}
            type="button"
            role="tab"
            aria-selected={locale === entry}
            className={`admin-seo-tab${locale === entry ? " is-active" : ""}`}
            onClick={() => setLocale(entry)}
          >
            {LOCALE_LABELS[entry]}
          </button>
        ))}
      </div>

      <AdminSeoFieldsForm
        draft={draft}
        defaults={defaults}
        flags={{ introduction: true, bottomContent: true, faq: true, cta: true }}
        idPrefix={`cat-${categoryId}-${locale}`}
        onChange={(next) => onChange(locale, next)}
      />
    </fieldset>
  );
}

export function buildInitialCategorySeoByLocale(
  seoDocument: SeoContentDocument,
  categoryId: string
): Partial<Record<Locale, SeoPageFieldsInput>> {
  return LOCALES.reduce<Partial<Record<Locale, SeoPageFieldsInput>>>((acc, locale) => {
    acc[locale] = getStoredCategorySeoFields(seoDocument, locale, categoryId);
    return acc;
  }, {});
}
