"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

import { AdminColorField } from "@/components/features/admin/admin-color-field";
import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import {
  AnnouncementPopupDialog,
  type AnnouncementEditableField
} from "@/components/layout/announcement-popup-dialog";
import { compressGalleryImage } from "@/lib/client/compress-image";
import { saveAnnouncementPopupAction } from "@/server/actions/announcement-popup.actions";
import type {
  AnnouncementPopupConfig,
  AnnouncementPopupCtaAlign,
  AnnouncementPopupCtaWidth,
  AnnouncementPopupImagePosition,
  AnnouncementPopupTextAlign
} from "@/types/content";

async function uploadPopupImageDataUrl(
  dataUrl: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const response = await fetch("/api/admin/gallery-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl })
  });
  const result = (await response.json()) as
    | { ok: true; url: string }
    | { ok: false; error: string };
  if (!response.ok || !result.ok) {
    return { ok: false, error: "error" in result ? result.error : "העלאה נכשלה" };
  }
  return result;
}

type AdminAnnouncementPopupEditorProps = {
  initialConfig: AnnouncementPopupConfig;
};

type PreviewDevice = "desktop" | "mobile";

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="admin-segmented" role="group" aria-label={label}>
      <span className="admin-segmented-label">{label}</span>
      <div className="admin-segmented-options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`admin-segmented-btn${value === option.value ? " is-active" : ""}`}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdminAnnouncementPopupEditor({ initialConfig }: AdminAnnouncementPopupEditorProps) {
  const router = useRouter();
  const { isPending, error, setError, run } = useAdminMutation();
  const [draft, setDraft] = useState<AnnouncementPopupConfig>(initialConfig);
  const [uploading, setUploading] = useState(false);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof AnnouncementPopupConfig>(
    key: K,
    value: AnnouncementPopupConfig[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onPreviewFieldChange = (field: AnnouncementEditableField, value: string) => {
    update(field, value);
  };

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await compressGalleryImage(file);
      const uploaded = await uploadPopupImageDataUrl(dataUrl);
      if (!uploaded.ok) throw new Error(uploaded.error);
      setDraft((prev) => ({
        ...prev,
        imageUrl: uploaded.url,
        imagePosition: prev.imagePosition === "none" ? "top" : prev.imagePosition,
        imageAlt: prev.imageAlt.trim() || file.name.replace(/\.[^.]+$/, "")
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "העלאת תמונה נכשלה");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="admin-announcement-workspace">
      <form
        className="admin-form admin-announcement-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            await saveAnnouncementPopupAction(draft);
            router.refresh();
          });
        }}
      >
        <label className="admin-checkbox-row">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(e) => update("enabled", e.target.checked)}
          />
          פופ־אפ פעיל באתר
        </label>

        <fieldset className="admin-fieldset">
          <legend>תוכן</legend>
          <label>
            קיקור (מעל הכותרת)
            <input
              value={draft.kicker}
              onChange={(e) => update("kicker", e.target.value)}
              placeholder="NB BURGER"
            />
          </label>
          <label>
            כותרת
            <input
              required
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="אנחנו מתכוננים לפתיחה"
            />
          </label>
          <label>
            טקסט גוף
            <textarea
              rows={7}
              value={draft.body}
              onChange={(e) => update("body", e.target.value)}
              placeholder={"שורה ראשונה\n\nפסקה שנייה"}
            />
            <span className="admin-form-hint">שורה ריקה בין פסקאות יוצרת הפרדה בפופ־אפ.</span>
          </label>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>צבעים</legend>
          <div className="admin-color-grid">
            <AdminColorField
              label="רקע"
              value={draft.backgroundColor}
              onChange={(value) => update("backgroundColor", value)}
            />
            <AdminColorField
              label="טקסט ראשי"
              value={draft.textColor}
              onChange={(value) => update("textColor", value)}
            />
            <AdminColorField
              label="טקסט משני"
              value={draft.mutedTextColor}
              onChange={(value) => update("mutedTextColor", value)}
            />
            <AdminColorField
              label="מסגרת"
              value={draft.borderColor}
              onChange={(value) => update("borderColor", value)}
            />
            <AdminColorField
              label="רקע כפתור"
              value={draft.ctaBackgroundColor}
              onChange={(value) => update("ctaBackgroundColor", value)}
            />
            <AdminColorField
              label="טקסט כפתור"
              value={draft.ctaTextColor}
              onChange={(value) => update("ctaTextColor", value)}
            />
          </div>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>פריסה ומיקומים</legend>
          <SegmentedControl
            label="יישור טקסט"
            value={draft.textAlign}
            onChange={(value) => update("textAlign", value as AnnouncementPopupTextAlign)}
            options={[
              { value: "right", label: "ימין" },
              { value: "center", label: "מרכז" },
              { value: "left", label: "שמאל" }
            ]}
          />
          <SegmentedControl
            label="מיקום כפתור"
            value={draft.ctaAlign}
            onChange={(value) => update("ctaAlign", value as AnnouncementPopupCtaAlign)}
            options={[
              { value: "start", label: "התחלה" },
              { value: "center", label: "מרכז" },
              { value: "end", label: "סוף" }
            ]}
          />
          <SegmentedControl
            label="רוחב כפתור"
            value={draft.ctaWidth}
            onChange={(value) => update("ctaWidth", value as AnnouncementPopupCtaWidth)}
            options={[
              { value: "full", label: "מלא" },
              { value: "auto", label: "לפי תוכן" }
            ]}
          />
          <label>
            מיקום תמונה
            <select
              value={draft.imagePosition}
              onChange={(e) =>
                update("imagePosition", e.target.value as AnnouncementPopupImagePosition)
              }
            >
              <option value="none">ללא תמונה</option>
              <option value="top">למעלה (מעל הקיקור)</option>
              <option value="bottom">למטה (מעל הכפתור)</option>
            </select>
          </label>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>כפתור CTA</legend>
          <label>
            טקסט הכפתור
            <input
              required
              value={draft.ctaLabel}
              onChange={(e) => update("ctaLabel", e.target.value)}
              placeholder="הבנתי"
            />
          </label>
          <label>
            קישור (אופציונלי)
            <input
              value={draft.ctaHref}
              onChange={(e) => update("ctaHref", e.target.value)}
              placeholder="/menu או https://…"
            />
            <span className="admin-form-hint">ריק = הכפתור רק סוגר את הפופ־אפ.</span>
          </label>
          <label className="admin-checkbox-row">
            <input
              type="checkbox"
              checked={draft.ctaOpenInNewTab}
              onChange={(e) => update("ctaOpenInNewTab", e.target.checked)}
              disabled={!draft.ctaHref.trim()}
            />
            לפתוח קישור בטאב חדש
          </label>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>תמונה</legend>
          <label>
            כתובת תמונה (URL)
            <input
              value={draft.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://… או /images/…"
            />
          </label>
          <label>
            טקסט אלטרנטיבי לתמונה
            <input
              value={draft.imageAlt}
              onChange={(e) => update("imageAlt", e.target.value)}
              placeholder="תיאור קצר"
            />
          </label>
          <div className="admin-announcement-upload">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => void onUpload(e.target.files?.[0])}
            />
            <button
              type="button"
              className="button secondary"
              disabled={isPending || uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "מעלה…" : "העלה תמונה"}
            </button>
            {draft.imageUrl ? (
              <button
                type="button"
                className="button secondary admin-btn-danger"
                disabled={isPending || uploading}
                onClick={() => {
                  update("imageUrl", "");
                  update("imagePosition", "none");
                }}
              >
                הסר תמונה
              </button>
            ) : null}
          </div>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>תזמון והצגה</legend>
          <label>
            השהייה לפני הופעה (שניות)
            <input
              type="number"
              min={0}
              max={120}
              value={draft.delaySeconds}
              onChange={(e) => update("delaySeconds", Number(e.target.value) || 0)}
            />
          </label>
          <label>
            כמה ימים לזכור סגירה
            <input
              type="number"
              min={0}
              max={3650}
              value={draft.dismissDays}
              onChange={(e) => update("dismissDays", Number(e.target.value) || 0)}
            />
            <span className="admin-form-hint">
              0 = זוכר לנצח עד שינוי גרסה. מספר חיובי = חוזר אחרי X ימים.
            </span>
          </label>
          <label>
            גרסת פופ־אפ
            <input
              value={draft.version}
              onChange={(e) => update("version", e.target.value)}
              placeholder="v1"
            />
            <span className="admin-form-hint">
              שנה גרסה (למשל v2) כדי להציג שוב גם למי שכבר סגר.
            </span>
          </label>
        </fieldset>

        {error ? <p className="admin-form-error">{error}</p> : null}
        <div className="admin-form-actions">
          <button className="button" type="submit" disabled={isPending || uploading}>
            {isPending ? "שומר…" : "שמור פופ־אפ"}
          </button>
        </div>
      </form>

      <aside className="admin-announcement-live" aria-label="תצוגה מקדימה חיה">
        <div className="admin-announcement-live-head">
          <div>
            <strong>תצוגה מקדימה לעריכה</strong>
            <p>לחצו על טקסט/כפתור כדי לערוך ישירות. בחרו צבעים מהסרגל.</p>
          </div>
          <div className="admin-announcement-device-toggle" role="group" aria-label="גודל תצוגה">
            <button
              type="button"
              className={`admin-segmented-btn${device === "desktop" ? " is-active" : ""}`}
              aria-pressed={device === "desktop"}
              onClick={() => setDevice("desktop")}
            >
              <Monitor size={15} aria-hidden />
              דסקטופ
            </button>
            <button
              type="button"
              className={`admin-segmented-btn${device === "mobile" ? " is-active" : ""}`}
              aria-pressed={device === "mobile"}
              onClick={() => setDevice("mobile")}
            >
              <Smartphone size={15} aria-hidden />
              מובייל
            </button>
          </div>
        </div>

        <div className="admin-announcement-preview-colors" aria-label="צבעים מהירים">
          <AdminColorField
            label="רקע"
            value={draft.backgroundColor}
            onChange={(value) => update("backgroundColor", value)}
          />
          <AdminColorField
            label="טקסט"
            value={draft.textColor}
            onChange={(value) => update("textColor", value)}
          />
          <AdminColorField
            label="כפתור"
            value={draft.ctaBackgroundColor}
            onChange={(value) => update("ctaBackgroundColor", value)}
          />
        </div>

        <div className={`admin-announcement-stage is-${device}`}>
          <div className="admin-announcement-stage-chrome" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="admin-announcement-stage-viewport">
            <div className="opening-announce-root is-preview is-editable-preview">
              <div className="opening-announce-backdrop" aria-hidden="true" />
              <AnnouncementPopupDialog
                config={draft}
                preview
                editable
                onFieldChange={onPreviewFieldChange}
              />
            </div>
          </div>
        </div>

        {!draft.enabled ? (
          <p className="admin-form-hint" role="status">
            הפופ־אפ כבוי באתר, אבל התצוגה המקדימה עדיין פעילה לעריכה.
          </p>
        ) : null}
      </aside>
    </div>
  );
}
