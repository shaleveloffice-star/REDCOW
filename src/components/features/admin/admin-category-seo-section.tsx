"use client";

import { useMemo, useState } from "react";

import { AdminSeoFieldsForm } from "@/components/features/admin/admin-seo-fields-form";
import { CATEGORY_SEO_FIELD_WHERE } from "@/components/features/admin/admin-field-label";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import {
  getDefaultCategorySeoFields,
  getStoredCategorySeoFields,
  pickCategorySeoFields
} from "@/lib/seo-content/admin-category-seo";
import type { SeoContentDocument, SeoPageFieldsInput } from "@/types/seo-content";

type AdminCategorySeoSectionProps = {
  categoryId: string;
  seoDocument: SeoContentDocument;
  seoByLocale: Partial<Record<Locale, SeoPageFieldsInput>>;
  locale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
  onChange: (locale: Locale, fields: SeoPageFieldsInput) => void;
};

export function AdminCategorySeoSection({
  categoryId,
  seoDocument,
  seoByLocale,
  locale: controlledLocale,
  onLocaleChange,
  onChange
}: AdminCategorySeoSectionProps) {
  const [internalLocale, setInternalLocale] = useState<Locale>("he");
  const locale = controlledLocale ?? internalLocale;

  const setLocale = (next: Locale) => {
    if (onLocaleChange) {
      onLocaleChange(next);
      return;
    }
    setInternalLocale(next);
  };

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
        flags={{ meta: false, introduction: true, bottomContent: true, faq: true, cta: true }}
        idPrefix={`cat-${categoryId}-${locale}`}
        fieldWhere={CATEGORY_SEO_FIELD_WHERE}
        onChange={(next) => onChange(locale, pickCategorySeoFields(next))}
      />
    </fieldset>
  );
}

export function buildInitialCategorySeoByLocale(
  seoDocument: SeoContentDocument,
  categoryId: string
): Partial<Record<Locale, SeoPageFieldsInput>> {
  return LOCALES.reduce<Partial<Record<Locale, SeoPageFieldsInput>>>((acc, entry) => {
    acc[entry] = getStoredCategorySeoFields(seoDocument, entry, categoryId);
    return acc;
  }, {});
}
