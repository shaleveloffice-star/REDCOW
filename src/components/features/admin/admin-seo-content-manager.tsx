"use client";

import { useMemo, useState } from "react";

import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import { getDefaultSeoPageFields } from "@/data/seo-content-defaults";
import { saveSeoPageFieldsAction } from "@/server/actions/seo-content.actions";
import type { MenuCategory } from "@/types/content";
import {
  SEO_PAGE_DEFINITIONS,
  type SeoContentDocument,
  type SeoFaqItem,
  type SeoPageFieldsInput,
  type SeoPageId
} from "@/types/seo-content";

const PARAGRAPH_HINT = "פסקאות מופרדות בשורה ריקה. שדה ריק = ברירת מחדל מהאתר.";

function emptyFields(): SeoPageFieldsInput {
  return {};
}

function cloneFields(fields: SeoPageFieldsInput | undefined): SeoPageFieldsInput {
  return {
    ...fields,
    faq: fields?.faq
      ? {
          ...fields.faq,
          items: fields.faq.items?.map((item) => ({ ...item })) ?? []
        }
      : undefined,
    cta: fields?.cta ? { ...fields.cta } : undefined,
    categoryIntros: fields?.categoryIntros ? { ...fields.categoryIntros } : undefined
  };
}

export function AdminSeoContentManager({
  document: initialDocument,
  categories
}: {
  document: SeoContentDocument;
  categories: MenuCategory[];
}) {
  const { isPending, error, setError, run } = useAdminMutation();
  const [locale, setLocale] = useState<Locale>("he");
  const [pageId, setPageId] = useState<SeoPageId>("home");
  const [document, setDocument] = useState(initialDocument);
  const [draft, setDraft] = useState<SeoPageFieldsInput>(() =>
    cloneFields(initialDocument.he?.pages?.home ?? emptyFields())
  );

  const pageDef = SEO_PAGE_DEFINITIONS.find((entry) => entry.id === pageId)!;
  const defaults = useMemo(() => getDefaultSeoPageFields(locale, pageId), [locale, pageId]);
  const lastUpdated = document[locale]?.updatedAt;

  const menuCategories = useMemo(
    () => categories.filter((category) => category.isActive !== false),
    [categories]
  );

  const switchLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setDraft(cloneFields(document[nextLocale]?.pages?.[pageId] ?? emptyFields()));
    setError(null);
  };

  const switchPage = (nextPageId: SeoPageId) => {
    setPageId(nextPageId);
    setDraft(cloneFields(document[locale]?.pages?.[nextPageId] ?? emptyFields()));
    setError(null);
  };

  const updateDraft = (patch: Partial<SeoPageFieldsInput>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const updateFaq = (patch: Partial<NonNullable<SeoPageFieldsInput["faq"]>>) => {
    setDraft((current) => ({
      ...current,
      faq: { ...(current.faq ?? {}), ...patch }
    }));
  };

  const updateFaqItem = (index: number, patch: Partial<SeoFaqItem>) => {
    setDraft((current) => {
      const items = [...(current.faq?.items ?? [])];
      items[index] = { ...(items[index] ?? { question: "", answer: "" }), ...patch };
      return { ...current, faq: { ...(current.faq ?? {}), items } };
    });
  };

  const addFaqItem = () => {
    setDraft((current) => ({
      ...current,
      faq: {
        ...(current.faq ?? {}),
        items: [...(current.faq?.items ?? []), { question: "", answer: "" }]
      }
    }));
  };

  const removeFaqItem = (index: number) => {
    setDraft((current) => ({
      ...current,
      faq: {
        ...(current.faq ?? {}),
        items: (current.faq?.items ?? []).filter((_, itemIndex) => itemIndex !== index)
      }
    }));
  };

  const updateCta = (patch: Partial<NonNullable<SeoPageFieldsInput["cta"]>>) => {
    setDraft((current) => ({
      ...current,
      cta: { ...(current.cta ?? {}), ...patch }
    }));
  };

  const updateCategoryIntro = (categoryId: string, value: string) => {
    setDraft((current) => ({
      ...current,
      categoryIntros: { ...(current.categoryIntros ?? {}), [categoryId]: value }
    }));
  };

  return (
    <div className="admin-seo-content">
      <div className="admin-seo-toolbar">
        <div className="admin-seo-tabs" role="tablist" aria-label="שפה">
          {LOCALES.map((entry) => (
            <button
              key={entry}
              type="button"
              role="tab"
              aria-selected={locale === entry}
              className={`admin-seo-tab${locale === entry ? " is-active" : ""}`}
              onClick={() => switchLocale(entry)}
            >
              {LOCALE_LABELS[entry]}
            </button>
          ))}
        </div>

        <label className="admin-seo-page-select">
          דף
          <select value={pageId} onChange={(event) => switchPage(event.target.value as SeoPageId)}>
            {SEO_PAGE_DEFINITIONS.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.labelHe}
              </option>
            ))}
          </select>
        </label>
      </div>

      {lastUpdated ? (
        <p className="admin-seo-meta">עודכן לאחרונה ({locale}): {new Date(lastUpdated).toLocaleString("he-IL")}</p>
      ) : (
        <p className="admin-seo-meta">טרם נשמר תוכן מותאם לשפה זו — מוצגות ברירות המחדל באתר.</p>
      )}

      <form
        className="admin-form admin-seo-form"
        onSubmit={(event) => {
          event.preventDefault();
          run(async () => {
            const saved = await saveSeoPageFieldsAction(locale, pageId, draft);
            setDocument((current) => ({
              ...current,
              [locale]: saved
            }));
          });
        }}
      >
        {pageDef.supportsSectionTitle ? (
          <label>
            כותרת מקטע
            <input
              value={draft.sectionTitle ?? ""}
              placeholder={defaults.sectionTitle ?? ""}
              onChange={(event) => updateDraft({ sectionTitle: event.target.value })}
            />
          </label>
        ) : null}

        <label>
          מבוא SEO
          <textarea
            rows={8}
            value={draft.introduction ?? ""}
            placeholder={defaults.introduction ?? ""}
            onChange={(event) => updateDraft({ introduction: event.target.value })}
          />
          <span className="admin-field-hint">{PARAGRAPH_HINT}</span>
        </label>

        <label>
          תוכן תחתון
          <textarea
            rows={6}
            value={draft.bottomContent ?? ""}
            placeholder={defaults.bottomContent ?? ""}
            onChange={(event) => updateDraft({ bottomContent: event.target.value })}
          />
          <span className="admin-field-hint">{PARAGRAPH_HINT}</span>
        </label>

        {pageDef.supportsCategoryIntros ? (
          <fieldset className="admin-seo-fieldset">
            <legend>הקדמות לקטגוריות תפריט</legend>
            {menuCategories.map((category) => (
              <label key={category.id}>
                {category.name}
                <textarea
                  rows={3}
                  value={draft.categoryIntros?.[category.id] ?? ""}
                  placeholder={defaults.categoryIntros?.[category.id] ?? ""}
                  onChange={(event) => updateCategoryIntro(category.id, event.target.value)}
                />
              </label>
            ))}
          </fieldset>
        ) : null}

        {pageDef.supportsFaq ? (
          <fieldset className="admin-seo-fieldset">
            <legend>שאלות ותשובות (FAQ)</legend>
            <label>
              כותרת עליונה
              <input
                value={draft.faq?.kicker ?? ""}
                placeholder={defaults.faq?.kicker ?? ""}
                onChange={(event) => updateFaq({ kicker: event.target.value })}
              />
            </label>
            <label>
              כותרת
              <input
                value={draft.faq?.title ?? ""}
                placeholder={defaults.faq?.title ?? ""}
                onChange={(event) => updateFaq({ title: event.target.value })}
              />
            </label>
            <label>
              פסקת פתיחה
              <textarea
                rows={2}
                value={draft.faq?.lead ?? ""}
                placeholder={defaults.faq?.lead ?? ""}
                onChange={(event) => updateFaq({ lead: event.target.value })}
              />
            </label>

            {(draft.faq?.items ?? defaults.faq?.items ?? []).map((item, index) => (
              <div key={`faq-${index}`} className="admin-seo-faq-item">
                <label>
                  שאלה {index + 1}
                  <input
                    value={draft.faq?.items?.[index]?.question ?? item.question}
                    onChange={(event) => updateFaqItem(index, { question: event.target.value })}
                  />
                </label>
                <label>
                  תשובה
                  <textarea
                    rows={3}
                    value={draft.faq?.items?.[index]?.answer ?? item.answer}
                    onChange={(event) => updateFaqItem(index, { answer: event.target.value })}
                  />
                </label>
                <button
                  type="button"
                  className="button secondary admin-btn-danger"
                  onClick={() => removeFaqItem(index)}
                >
                  הסר שאלה
                </button>
              </div>
            ))}

            <button type="button" className="button secondary" onClick={addFaqItem}>
              הוסף שאלה
            </button>
          </fieldset>
        ) : null}

        {pageDef.supportsCta ? (
          <fieldset className="admin-seo-fieldset">
            <legend>בלוק CTA (אופציונלי)</legend>
            <label>
              כותרת
              <input
                value={draft.cta?.title ?? ""}
                placeholder={defaults.cta?.title ?? ""}
                onChange={(event) => updateCta({ title: event.target.value })}
              />
            </label>
            <label>
              טקסט
              <textarea
                rows={3}
                value={draft.cta?.body ?? ""}
                placeholder={defaults.cta?.body ?? ""}
                onChange={(event) => updateCta({ body: event.target.value })}
              />
            </label>
            <label>
              טקסט כפתור
              <input
                value={draft.cta?.buttonLabel ?? ""}
                placeholder={defaults.cta?.buttonLabel ?? ""}
                onChange={(event) => updateCta({ buttonLabel: event.target.value })}
              />
            </label>
            <label>
              קישור כפתור
              <input
                value={draft.cta?.buttonHref ?? ""}
                placeholder={defaults.cta?.buttonHref ?? "/menu"}
                onChange={(event) => updateCta({ buttonHref: event.target.value })}
              />
            </label>
          </fieldset>
        ) : null}

        {error ? <p className="admin-form-error">{error}</p> : null}

        <div className="admin-form-actions">
          <button className="button" disabled={isPending} type="submit">
            {isPending ? "שומר…" : "שמור תוכן SEO"}
          </button>
        </div>
      </form>
    </div>
  );
}
