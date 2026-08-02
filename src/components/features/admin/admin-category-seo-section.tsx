"use client";

import { useMemo } from "react";

import { AdminSeoFieldsForm } from "@/components/features/admin/admin-seo-fields-form";
import { CATEGORY_SEO_FIELD_WHERE } from "@/components/features/admin/admin-field-label";
import {
  getCategoryMetaPlaceholders,
  getDefaultCategorySeoFields,
  getStoredCategorySeoFields,
  pickCategorySeoFields
} from "@/lib/seo-content/admin-category-seo";
import type { MenuCategory } from "@/types/content";
import type { SeoContentDocument, SeoPageFieldsInput } from "@/types/seo-content";

type AdminCategorySeoSectionProps = {
  categoryId: string;
  category: Pick<MenuCategory, "id" | "name" | "description">;
  seoDocument: SeoContentDocument;
  seoFields: SeoPageFieldsInput;
  onChange: (fields: SeoPageFieldsInput) => void;
};

export function AdminCategorySeoSection({
  categoryId,
  category,
  seoDocument,
  seoFields,
  onChange
}: AdminCategorySeoSectionProps) {
  const draft =
    Object.keys(seoFields).length > 0
      ? seoFields
      : getStoredCategorySeoFields(seoDocument, "he", categoryId);
  const bodyDefaults = useMemo(() => getDefaultCategorySeoFields("he", categoryId), [categoryId]);
  const defaults = useMemo(
    () => ({
      ...bodyDefaults,
      ...getCategoryMetaPlaceholders(category, draft)
    }),
    [bodyDefaults, category, draft]
  );

  return (
    <fieldset className="admin-seo-fieldset">
      <legend>תוכן SEO</legend>
      <p className="admin-field-hint">
        עריכה בעברית בלבד. תרגום EN/FR מוצג אוטומטית למבקרים באתר.
      </p>

      <AdminSeoFieldsForm
        draft={draft}
        defaults={defaults}
        flags={{ meta: true, introduction: true, bottomContent: true, faq: true, cta: true }}
        idPrefix={`cat-${categoryId}-he`}
        fieldWhere={CATEGORY_SEO_FIELD_WHERE}
        onChange={(next) => onChange(pickCategorySeoFields(next))}
      />
    </fieldset>
  );
}

export function buildInitialCategorySeoFields(
  seoDocument: SeoContentDocument,
  categoryId: string
): SeoPageFieldsInput {
  return getStoredCategorySeoFields(seoDocument, "he", categoryId);
}
