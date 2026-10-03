"use client";

import { AdminFormFooter, AdminModal, useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { adminFieldLabel } from "@/components/features/admin/admin-field-label";
import { AdminSiteImagePicker } from "@/components/features/admin/admin-site-image-picker";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { MENU_PRIMARY_IMAGE_SPEC } from "@/data/admin-image-specs";
import { createId } from "@/lib/admin/new-id";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
import { compressMenuPrimaryImage } from "@/lib/client/compress-image";
import { menuImageZoomStyle, normalizeMenuImageZoom } from "@/lib/menu/image-zoom";
import { saveMenuIngredientsAction } from "@/server/actions/menu-ingredients.actions";
import type { MenuIngredient } from "@/types/menu-ingredients";
import { useState, type ChangeEvent } from "react";

function newIngredient(rows: MenuIngredient[]): MenuIngredient {
  return { id: createId("ingredient"), name: "", description: "", imageUrl: "", isActive: true, sortOrder: rows.length + 1 };
}

export function AdminMenuIngredientsManager({
  ingredients,
  pickableImages
}: {
  ingredients: MenuIngredient[];
  pickableImages: AdminPickableImage[];
}) {
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [rows, setRows] = useState(ingredients);
  const [draft, setDraft] = useState<MenuIngredient | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const persist = (next: MenuIngredient[], onSuccess?: () => void) => {
    run(async () => {
      const result = await saveMenuIngredientsAction(next);
      if (!result.ok) throw new Error(result.error);
      setRows(result.items);
    }, onSuccess);
  };

  const close = () => {
    setDraft(null);
    setError(null);
  };

  const submit = () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      setError("שם המרכיב נדרש.");
      return;
    }
    const exists = rows.some(row => row.id === draft.id);
    persist(exists ? rows.map(row => (row.id === draft.id ? draft : row)) : [...rows, draft], close);
  };

  const remove = (ingredient: MenuIngredient) => {
    if (!confirmDelete(ingredient.name)) return;
    persist(rows.filter(row => row.id !== ingredient.id));
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !draft) return;
    const targetId = draft.id;
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await compressMenuPrimaryImage(file);
      const response = await fetch("/api/admin/menu-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ dataUrl, title: draft.name.trim() || file.name })
      });
      let result: { ok: true; url: string } | { ok: false; error: string };
      try {
        result = (await response.json()) as typeof result;
      } catch {
        setError(`העלאת התמונה נכשלה (${response.status}). רעננו את הדף ונסו שוב.`);
        return;
      }
      if (!result.ok) {
        setError(result.error || "העלאת התמונה נכשלה.");
        return;
      }
      const uploadedUrl = result.url;
      setDraft(prev => (prev && prev.id === targetId ? { ...prev, imageUrl: uploadedUrl } : prev));
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "העלאת התמונה נכשלה. נסו קובץ JPG או PNG.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <p className="muted">
        מרכיבים לא מופיעים בתפריט. אחרי שמוסיפים מרכיב כאן, משייכים אותו למנה בעריכת המנה (בטאב ״ניהול תפריט״, בחלק ״רטבים ומרכיבים״), והוא יוצג בעמוד המנה לצד הרטבים.
      </p>
      <div className="admin-row-actions">
        <button className="button" type="button" disabled={isPending} onClick={() => setDraft(newIngredient(rows))}>
          הוסף מרכיב
        </button>
      </div>
      {error && !draft ? <p className="admin-form-error" role="alert">{error}</p> : null}

      {rows.length === 0 ? (
        <p className="muted">עדיין אין מרכיבים. לחצו ״הוסף מרכיב״ כדי להתחיל.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>סדר</th>
              <th>תמונה</th>
              <th>מרכיב</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <td>{row.sortOrder}</td>
                <td>
                  {row.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.imageUrl} alt="" className="admin-menu-thumb" width={56} height={56} loading="lazy" style={menuImageZoomStyle(row.imageZoom)} />
                  ) : "—"}
                </td>
                <td>
                  <strong>{row.name}</strong>
                  {row.description ? <p className="muted">{row.description}</p> : null}
                </td>
                <td><StatusBadge active={row.isActive} /></td>
                <td>
                  <div className="admin-row-actions">
                    <button className="button secondary" type="button" disabled={isPending} onClick={() => setDraft({ ...row })}>עריכה</button>
                    <button className="button secondary admin-btn-danger" type="button" disabled={isPending} onClick={() => remove(row)}>מחק</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AdminModal title={draft && rows.some(row => row.id === draft.id) ? "עריכת מרכיב" : "מרכיב חדש"} open={draft !== null} onClose={close}>
        {draft ? (
          <form className="admin-form" onSubmit={event => { event.preventDefault(); submit(); }}>
            <label>
              {adminFieldLabel("שם המרכיב", "מוצג מתחת לתמונה בעמוד המנה")}
              <input required maxLength={120} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} />
            </label>
            <label>
              {adminFieldLabel("תיאור", "מוצג בחלון שנפתח בלחיצה על המרכיב")}
              <textarea rows={3} maxLength={500} value={draft.description ?? ""} onChange={event => setDraft({ ...draft, description: event.target.value })} />
            </label>

            <label>
              {adminFieldLabel("תמונת המרכיב", "עיגול קטן בעמוד המנה")}
              <div className="admin-image-url-field">
                <input accept="image/*" disabled={uploading} type="file" onChange={event => void uploadImage(event)} />
                <button className="button secondary" type="button" onClick={() => setGalleryOpen(true)}>בחר מהגלריה</button>
              </div>
            </label>
            {uploading ? <p className="muted">דוחס ומעלה תמונה…</p> : null}
            {draft.imageUrl ? (
              <div className="admin-image-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" height={120} width={120} src={draft.imageUrl} style={menuImageZoomStyle(draft.imageZoom)} />
              </div>
            ) : null}
            <label>
              זום למרכז התמונה — {Math.round(normalizeMenuImageZoom(draft.imageZoom) * 100)}%
              <input type="range" min={1} max={3} step={0.05} value={normalizeMenuImageZoom(draft.imageZoom)} onChange={event => setDraft({ ...draft, imageZoom: Number(event.target.value) })} />
            </label>

            <details>
              <summary>תרגום לאנגלית ולצרפתית (לא חובה — ריק = מוצג בעברית)</summary>
              <label>
                שם באנגלית
                <input maxLength={120} value={draft.nameEn ?? ""} onChange={event => setDraft({ ...draft, nameEn: event.target.value })} />
              </label>
              <label>
                תיאור באנגלית
                <textarea rows={2} maxLength={500} value={draft.descriptionEn ?? ""} onChange={event => setDraft({ ...draft, descriptionEn: event.target.value })} />
              </label>
              <label>
                שם בצרפתית
                <input maxLength={120} value={draft.nameFr ?? ""} onChange={event => setDraft({ ...draft, nameFr: event.target.value })} />
              </label>
              <label>
                תיאור בצרפתית
                <textarea rows={2} maxLength={500} value={draft.descriptionFr ?? ""} onChange={event => setDraft({ ...draft, descriptionFr: event.target.value })} />
              </label>
            </details>

            <label>
              {adminFieldLabel("סדר תצוגה", "הסדר ברשימת המרכיבים באדמין")}
              <input type="number" min={0} value={draft.sortOrder} onChange={event => setDraft({ ...draft, sortOrder: parseInt(event.target.value, 10) || 0 })} />
            </label>
            <label className="admin-checkbox-row">
              <input type="checkbox" checked={draft.isActive} onChange={event => setDraft({ ...draft, isActive: event.target.checked })} />
              <span>{adminFieldLabel("מרכיב פעיל", "לא פעיל = לא יוצג באף מנה")}</span>
            </label>
            <AdminFormFooter error={error} isPending={isPending || uploading} onCancel={close} />
          </form>
        ) : null}
      </AdminModal>

      <AdminSiteImagePicker
        open={draft !== null && galleryOpen}
        title="בחירת תמונה מהגלריה"
        images={pickableImages}
        spec={MENU_PRIMARY_IMAGE_SPEC}
        fieldLabel="תמונת המרכיב"
        onClose={() => setGalleryOpen(false)}
        onSelect={url => setDraft(prev => (prev ? { ...prev, imageUrl: url } : prev))}
      />
    </>
  );
}
