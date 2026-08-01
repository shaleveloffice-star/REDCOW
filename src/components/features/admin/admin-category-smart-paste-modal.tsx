"use client";

import { useMemo, useState } from "react";

import { AdminModal } from "@/components/features/admin/admin-crud-ui";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import {
  applyCategorySmartPaste,
  wouldOverwriteExistingContent
} from "@/lib/admin/category-smart-paste/apply-parsed";
import { parseCategorySmartPaste } from "@/lib/admin/category-smart-paste/parser";
import type { CategorySmartPastePreview } from "@/lib/admin/category-smart-paste/types";
import type { MenuCategory } from "@/types/content";
import type { SeoPageFieldsInput } from "@/types/seo-content";

type AdminCategorySmartPasteModalProps = {
  open: boolean;
  onClose: () => void;
  seoLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
  draft: MenuCategory;
  seoFields: SeoPageFieldsInput;
  onApply: (nextDraft: MenuCategory, nextSeo: SeoPageFieldsInput) => void;
};

function SmartPastePreview({ preview }: { preview: CategorySmartPastePreview }) {
  return (
    <div className="admin-smart-paste-preview" aria-live="polite">
      <ul className="admin-smart-paste-preview-list">
        <li>זוהו {preview.fieldsCount} שדות</li>
        <li>זוהו {preview.faqPairCount} שאלות FAQ</li>
        <li>{preview.ctaDetected ? "זוהה בלוק CTA" : "לא זוהה בלוק CTA"}</li>
        <li>
          {preview.unknownHeadings.length > 0
            ? `נמצאו ${preview.unknownHeadings.length} כותרות לא מוכרות`
            : "לא נמצאו כותרות לא מוכרות"}
        </li>
      </ul>

      {preview.unknownHeadings.length > 0 ? (
        <details className="admin-smart-paste-details">
          <summary>כותרות שלא זוהו</summary>
          <ul>
            {preview.unknownHeadings.map((heading, index) => (
              <li key={`${index}-${heading}`}>{heading}</li>
            ))}
          </ul>
        </details>
      ) : null}

      {preview.warnings.length > 0 ? (
        <div className="admin-smart-paste-warnings" role="status">
          {preview.warnings.map((warning, index) => (
            <p key={`${index}-${warning}`}>{warning}</p>
          ))}
        </div>
      ) : null}

      {!preview.hasAnyField ? (
        <p className="admin-form-error">
          לא הצלחנו לזהות שדות בטקסט. יש לוודא שהכותרות תואמות לפורמט הנתמך.
        </p>
      ) : null}
    </div>
  );
}

export function AdminCategorySmartPasteModal({
  open,
  onClose,
  seoLocale,
  onLocaleChange,
  draft,
  seoFields,
  onApply
}: AdminCategorySmartPasteModalProps) {
  const [rawText, setRawText] = useState("");
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  const preview = useMemo(
    () => (rawText.trim() ? parseCategorySmartPaste(rawText) : null),
    [rawText]
  );

  const reset = () => {
    setRawText("");
    setConfirmOverwrite(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFill = () => {
    if (!preview?.hasAnyField) return;

    const hasExisting = wouldOverwriteExistingContent(preview, draft, seoFields);
    if (hasExisting && !confirmOverwrite) {
      setConfirmOverwrite(true);
      return;
    }

    const applied = applyCategorySmartPaste(preview, draft, seoFields);
    onApply(applied.draft, applied.seoFields);
    reset();
    onClose();
  };

  return (
    <AdminModal open={open} stacked title="הדבקה חכמה" onClose={handleClose}>
      <div className="admin-smart-paste-modal">
        <p className="admin-field-hint">
          הדביקו טקסט עם כותרות שדות (שם, Slug, מבוא SEO, FAQ, CTA). תוכן SEO ימולא לשפת:{" "}
          {LOCALE_LABELS[seoLocale]}.
        </p>

        <div className="admin-seo-tabs" role="tablist" aria-label="שפת מילוי SEO">
          {LOCALES.map((entry) => (
            <button
              key={entry}
              type="button"
              role="tab"
              aria-selected={seoLocale === entry}
              className={`admin-seo-tab${seoLocale === entry ? " is-active" : ""}`}
              onClick={() => onLocaleChange(entry)}
            >
              {LOCALE_LABELS[entry]}
            </button>
          ))}
        </div>

        <label>
          טקסט מלא
          <textarea
            className="admin-smart-paste-textarea"
            rows={14}
            value={rawText}
            placeholder="הדביקו כאן את כל תוכן הקטגוריה לפי כותרות השדות..."
            onChange={(event) => {
              setRawText(event.target.value);
              setConfirmOverwrite(false);
            }}
          />
        </label>

        {preview ? <SmartPastePreview preview={preview} /> : null}

        {confirmOverwrite ? (
          <div className="admin-smart-paste-overwrite" role="alert">
            <p>חלק מהשדות כבר מכילים תוכן. מילוי מטקסט יחליף רק את השדות שזוהו.</p>
            <div className="admin-form-actions">
              <button className="button" type="button" onClick={handleFill}>
                המשך ומלא
              </button>
              <button className="button secondary" type="button" onClick={() => setConfirmOverwrite(false)}>
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <div className="admin-form-actions">
            <button
              className="button"
              type="button"
              disabled={!preview?.hasAnyField}
              onClick={handleFill}
            >
              מלא את הטופס
            </button>
            <button className="button secondary" type="button" onClick={handleClose}>
              ביטול
            </button>
          </div>
        )}
      </div>
    </AdminModal>
  );
}
