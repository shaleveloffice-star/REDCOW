"use client";

import type { SeoFaqItem, SeoPageFieldsInput, SeoPageId } from "@/types/seo-content";
import { SEO_PAGE_DEFINITIONS } from "@/types/seo-content";

export const SEO_PARAGRAPH_HINT = "פסקאות מופרדות בשורה ריקה. שדה ריק = ברירת מחדל מהאתר.";

export type AdminSeoFieldsFlags = {
  sectionTitle?: boolean;
  introduction?: boolean;
  bottomContent?: boolean;
  faq?: boolean;
  cta?: boolean;
};

type AdminSeoFieldsFormProps = {
  draft: SeoPageFieldsInput;
  defaults: SeoPageFieldsInput;
  flags: AdminSeoFieldsFlags;
  onChange: (next: SeoPageFieldsInput) => void;
  idPrefix?: string;
};

export function AdminSeoFieldsForm({
  draft,
  defaults,
  flags,
  onChange,
  idPrefix = "seo"
}: AdminSeoFieldsFormProps) {
  const update = (patch: Partial<SeoPageFieldsInput>) => onChange({ ...draft, ...patch });

  const updateFaq = (patch: Partial<NonNullable<SeoPageFieldsInput["faq"]>>) =>
    onChange({ ...draft, faq: { ...(draft.faq ?? {}), ...patch } });

  const updateFaqItem = (index: number, patch: Partial<SeoFaqItem>) => {
    const items = [...(draft.faq?.items ?? [])];
    items[index] = { ...(items[index] ?? { question: "", answer: "" }), ...patch };
    onChange({ ...draft, faq: { ...(draft.faq ?? {}), items } });
  };

  const updateCta = (patch: Partial<NonNullable<SeoPageFieldsInput["cta"]>>) =>
    onChange({ ...draft, cta: { ...(draft.cta ?? {}), ...patch } });

  return (
    <div className="admin-seo-fields">
      {flags.sectionTitle ? (
        <label>
          כותרת מקטע
          <input
            value={draft.sectionTitle ?? ""}
            placeholder={defaults.sectionTitle ?? ""}
            onChange={(event) => update({ sectionTitle: event.target.value })}
          />
        </label>
      ) : null}

      {flags.introduction !== false ? (
        <label>
          מבוא SEO
          <textarea
            rows={6}
            value={draft.introduction ?? ""}
            placeholder={defaults.introduction ?? ""}
            onChange={(event) => update({ introduction: event.target.value })}
          />
          <span className="admin-field-hint">{SEO_PARAGRAPH_HINT}</span>
        </label>
      ) : null}

      {flags.bottomContent !== false ? (
        <label>
          תוכן תחתון
          <textarea
            rows={5}
            value={draft.bottomContent ?? ""}
            placeholder={defaults.bottomContent ?? ""}
            onChange={(event) => update({ bottomContent: event.target.value })}
          />
          <span className="admin-field-hint">{SEO_PARAGRAPH_HINT}</span>
        </label>
      ) : null}

      {flags.faq ? (
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
            <div key={`${idPrefix}-faq-${index}`} className="admin-seo-faq-item">
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
                onClick={() =>
                  onChange({
                    ...draft,
                    faq: {
                      ...(draft.faq ?? {}),
                      items: (draft.faq?.items ?? []).filter((_, itemIndex) => itemIndex !== index)
                    }
                  })
                }
              >
                הסר שאלה
              </button>
            </div>
          ))}

          <button
            type="button"
            className="button secondary"
            onClick={() =>
              onChange({
                ...draft,
                faq: {
                  ...(draft.faq ?? {}),
                  items: [...(draft.faq?.items ?? []), { question: "", answer: "" }]
                }
              })
            }
          >
            הוסף שאלה
          </button>
        </fieldset>
      ) : null}

      {flags.cta ? (
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
    </div>
  );
}

export function flagsFromPageDefinition(
  pageId: SeoPageId,
  overrides?: Partial<AdminSeoFieldsFlags>
): AdminSeoFieldsFlags {
  const definition = SEO_PAGE_DEFINITIONS.find((entry) => entry.id === pageId);
  return {
    sectionTitle: definition?.supportsSectionTitle ?? false,
    introduction: true,
    bottomContent: true,
    faq: definition?.supportsFaq ?? false,
    cta: definition?.supportsCta ?? false,
    ...overrides
  };
}
