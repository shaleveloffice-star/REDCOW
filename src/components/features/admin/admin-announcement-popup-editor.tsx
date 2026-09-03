"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { compressGalleryImage } from "@/lib/client/compress-image";
import { saveAnnouncementPopupAction } from "@/server/actions/announcement-popup.actions";
import type { AnnouncementPopupConfig, AnnouncementPopupImagePosition } from "@/types/content";

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

export function AdminAnnouncementPopupEditor({ initialConfig }: AdminAnnouncementPopupEditorProps) {
  const router = useRouter();
  const { isPending, error, setError, run } = useAdminMutation();
  const [draft, setDraft] = useState<AnnouncementPopupConfig>(initialConfig);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof AnnouncementPopupConfig>(
    key: K,
    value: AnnouncementPopupConfig[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
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
            rows={8}
            value={draft.body}
            onChange={(e) => update("body", e.target.value)}
            placeholder={"שורה ראשונה\n\nפסקה שנייה"}
          />
          <span className="admin-form-hint">שורה ריקה בין פסקאות יוצרת הפרדה בפופ־אפ.</span>
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
        {draft.imageUrl ? (
          <div className="admin-announcement-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={draft.imageUrl} alt={draft.imageAlt || "תצוגה מקדימה"} />
          </div>
        ) : null}
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
  );
}
