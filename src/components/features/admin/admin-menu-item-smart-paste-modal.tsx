"use client";

import { useMemo, useState } from "react";

import { AdminModal } from "@/components/features/admin/admin-crud-ui";
import {
  applyMenuItemSmartPaste,
  wouldOverwriteMenuItemContent
} from "@/lib/admin/menu-item-smart-paste/apply-parsed";
import { parseMenuItemSmartPaste } from "@/lib/admin/menu-item-smart-paste/parser";
import type { MenuItemSmartPastePreview } from "@/lib/admin/menu-item-smart-paste/types";
import type { MenuCategory, MenuItem } from "@/types/content";

type AdminMenuItemSmartPasteModalProps = {
  open: boolean;
  onClose: () => void;
  draft: MenuItem;
  categories: MenuCategory[];
  onApply: (nextDraft: MenuItem, slugTouched: boolean, warnings: string[]) => void;
};

function SmartPastePreview({ preview }: { preview: MenuItemSmartPastePreview }) {
  return (
    <div className="admin-smart-paste-preview" aria-live="polite">
      <ul className="admin-smart-paste-preview-list">
        <li>זוהו {preview.fieldsCount} שדות</li>
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

export function AdminMenuItemSmartPasteModal({
  open,
  onClose,
  draft,
  categories,
  onApply
}: AdminMenuItemSmartPasteModalProps) {
  const [rawText, setRawText] = useState("");
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  const preview = useMemo(
    () => (rawText.trim() ? parseMenuItemSmartPaste(rawText) : null),
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

    const hasExisting = wouldOverwriteMenuItemContent(preview, draft);
    if (hasExisting && !confirmOverwrite) {
      setConfirmOverwrite(true);
      return;
    }

    const applied = applyMenuItemSmartPaste(preview, draft, categories);
    onApply(applied.draft, applied.slugTouched, applied.warnings);
    reset();
    onClose();
  };

  return (
    <AdminModal open={open} stacked title="הדבקה חכמה" onClose={handleClose}>
      <div className="admin-smart-paste-modal">
        <p className="admin-field-hint">
          הדביקו טקסט עם כותרות שדות (שם המנה, מחיר, תיאור קצר, תיאור ארוך, כותרת מטא ועוד).
          רק שדות שיזוהו ימולאו — ללא שמירה אוטומטית.
        </p>

        <label>
          טקסט מלא
          <textarea
            className="admin-smart-paste-textarea"
            rows={14}
            value={rawText}
            placeholder={`שם המנה\nNB Classic\n\nמחיר\n58\n\nתיאור קצר\n...\n\nתיאור ארוך\n...\n\nכותרת מטא\n...\n\nתיאור מטא\n...`}
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
