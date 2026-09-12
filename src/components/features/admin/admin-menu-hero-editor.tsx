"use client";

import { useState } from "react";
import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { AdminImageUrlField } from "@/components/features/admin/admin-site-image-picker";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
import { DEFAULT_MENU_HERO, MENU_HERO_HEIGHT_LIMITS } from "@/lib/menu/menu-hero-config";
import { saveMenuHeroAction } from "@/server/actions/menu-hero.actions";
import type { MenuHeroConfig, MenuHeroInput } from "@/types/menu-hero";

export function AdminMenuHeroEditor({ initialConfig, images }: {
  initialConfig: MenuHeroConfig;
  images: AdminPickableImage[];
}) {
  const [draft, setDraft] = useState<MenuHeroInput>(initialConfig);
  const [saved, setSaved] = useState(false);
  const { isPending, error, setError, run } = useAdminMutation();
  const change = (patch: Partial<MenuHeroInput>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setSaved(false);
    setError(null);
  };

  return (
    <form className="admin-form" onSubmit={(event) => {
      event.preventDefault();
      setSaved(false);
      run(async () => {
        setDraft(await saveMenuHeroAction(draft));
        setSaved(true);
      });
    }}>
      <fieldset className="admin-menu-hero-fields" disabled={isPending}>
        <legend className="sr-only">הגדרות הבאנר העליון של התפריט</legend>
        <label>
          מה להציג בבאנר
          <select value={draft.mediaType} onChange={(event) => change({ mediaType: event.target.value as MenuHeroInput["mediaType"] })}>
            <option value="image">תמונה</option>
            <option value="video">וידאו</option>
            <option value="none">הסתרת הבאנר</option>
          </select>
        </label>

        {draft.mediaType === "image" ? (
          <AdminImageUrlField label="תמונת הבאנר" value={draft.imageUrl} images={images} required
            onChange={(imageUrl) => change({ imageUrl })} />
        ) : null}

        {draft.mediaType === "video" ? (
          <>
            <label>
              קישור לקובץ וידאו
              <input dir="ltr" required value={draft.videoUrl} onChange={(event) => change({ videoUrl: event.target.value })} />
            </label>
            <p className="admin-form-hint">קישור ישיר לקובץ MP4, WebM או MOV. הווידאו מוצג ללא קול וכולל כפתור עצירה.</p>
            <AdminImageUrlField label="תמונת המתנה לווידאו" value={draft.posterUrl} images={images}
              onChange={(posterUrl) => change({ posterUrl })} />
          </>
        ) : null}

        {draft.mediaType !== "none" ? (
          <>
            <label>
              תיאור המדיה לנגישות
              <input value={draft.alt} maxLength={300} placeholder="ריק - שימוש בתיאור ברירת המחדל בשפת האתר"
                onChange={(event) => change({ alt: event.target.value })} />
            </label>
            <div className="admin-menu-hero-heights">
              <label>
                גובה במובייל (פיקסלים)
                <input type="number" required step={1} {...MENU_HERO_HEIGHT_LIMITS.mobile} value={draft.mobileHeight}
                  onChange={(event) => change({ mobileHeight: Number(event.target.value) })} />
              </label>
              <label>
                גובה במחשב (פיקסלים)
                <input type="number" required step={1} {...MENU_HERO_HEIGHT_LIMITS.desktop} value={draft.desktopHeight}
                  onChange={(event) => change({ desktopHeight: Number(event.target.value) })} />
              </label>
            </div>
            <p className="admin-form-hint">המדיה ממלאת את הבאנר ונחתכת לפי גודל המסך. מומלץ להשאיר את מרכז התמונה פנוי לנושא המרכזי.</p>
          </>
        ) : <p className="admin-form-hint">לאחר שמירה, דף התפריט יתחיל בכותרת מתחת לניווט העליון.</p>}

        <div className="admin-form-actions">
          <button className="button" type="submit">{isPending ? "שומר…" : "שמירת הבאנר"}</button>
          <button className="button secondary" type="button" onClick={() => change(DEFAULT_MENU_HERO)}>טען ברירת מחדל</button>
          <a className="button secondary" href="/menu" target="_blank" rel="noreferrer">צפייה בדף התפריט</a>
        </div>
        <p className="admin-form-hint">השינויים, כולל טעינת ברירת המחדל, מתפרסמים רק בלחיצה על שמירת הבאנר.</p>
      </fieldset>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      {saved ? <p role="status">הבאנר נשמר ועודכן בדף התפריט.</p> : null}
    </form>
  );
}
