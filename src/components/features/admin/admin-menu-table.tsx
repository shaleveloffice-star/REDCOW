"use client";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { AdminMenuItemSmartPasteModal } from "@/components/features/admin/admin-menu-item-smart-paste-modal";
import { adminFieldLabel } from "@/components/features/admin/admin-field-label";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { createId } from "@/lib/admin/new-id";
import {
  compressMenuCloseUpImage,
  compressMenuPrimaryImage
} from "@/lib/client/compress-image";
import { getMenuItemHref, resolveMenuItemSlug, slugifyProductName } from "@/lib/menu/product-slug";
import { resolveMenuItemCloseUpAlt, resolveMenuItemImageAlt } from "@/lib/image-alt";
import { deleteMenuItemAction } from "@/server/actions/menu.actions";
import type { MenuCategory, MenuItem } from "@/types/content";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

type SaveMenuItemApiResult =
  | { ok: true; item: MenuItem }
  | { ok: false; error: string };

async function uploadMenuImageDataUrl(
  imageUrl: string,
  failureLabel: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!imageUrl.startsWith("data:image/")) {
    return { ok: true, url: imageUrl };
  }

  const uploadResponse = await fetch("/api/admin/menu-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ dataUrl: imageUrl })
  });

  let uploadResult: { ok: true; url: string } | { ok: false; error: string };
  try {
    uploadResult = (await uploadResponse.json()) as typeof uploadResult;
  } catch {
    return {
      ok: false,
      error: `${failureLabel} נכשלה לפני השמירה (${uploadResponse.status}).`
    };
  }

  if (!uploadResult.ok) {
    return { ok: false, error: uploadResult.error };
  }

  return { ok: true, url: uploadResult.url };
}

async function saveMenuItemViaApi(item: MenuItem): Promise<SaveMenuItemApiResult> {
  const primaryUpload = await uploadMenuImageDataUrl(item.imageUrl, "העלאת התמונה הראשית");
  if (!primaryUpload.ok) {
    return { ok: false, error: primaryUpload.error };
  }

  const closeUpRaw = String(item.closeUpImageUrl ?? "").trim();
  let closeUpImageUrl = closeUpRaw;
  if (closeUpRaw) {
    const closeUpUpload = await uploadMenuImageDataUrl(closeUpRaw, "העלאת תמונת המקרוב");
    if (!closeUpUpload.ok) {
      return { ok: false, error: closeUpUpload.error };
    }
    closeUpImageUrl = closeUpUpload.url;
  }

  const response = await fetch("/api/admin/menu-item", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      ...item,
      imageUrl: primaryUpload.url,
      closeUpImageUrl
    })
  });

  let result: SaveMenuItemApiResult;
  try {
    result = (await response.json()) as SaveMenuItemApiResult;
  } catch {
    return {
      ok: false,
      error: `שמירת המנה נכשלה (${response.status}). רעננו את הדף ונסו שוב.`
    };
  }

  if (!result.ok) {
    return {
      ok: false,
      error: result.error || `שמירת המנה נכשלה (${response.status}).`
    };
  }

  return result;
}

function newMenuItem(categories: MenuCategory[], items: MenuItem[]): MenuItem {
  const now = new Date().toISOString();
  return {
    id: createId("item"),
    name: "",
    description: "",
    longDescription: "",
    price: 0,
    categoryId: categories[0]?.id ?? "",
    imageUrl: "/images/menu/nb-menu-burger.png",
    closeUpImageUrl: "",
    slug: "",
    imageAlt: "",
    primaryKeyword: "",
    metaTitle: "",
    metaDescription: "",
    isActive: true,
    tags: [],
    sortOrder: items.length + 1,
    createdAt: now,
    updatedAt: now
  };
}

export function AdminMenuTable({
  items,
  categories
}: {
  items: MenuItem[];
  categories: MenuCategory[];
}) {
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [rows, setRows] = useState(items);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [draft, setDraft] = useState<MenuItem | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [smartPasteOpen, setSmartPasteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCloseUpImage, setUploadingCloseUpImage] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isNew = draft ? !rows.some((i) => i.id === draft.id) : false;

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.categoryId] = (counts[row.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const list = categoryFilter
      ? rows.filter((row) => row.categoryId === categoryFilter)
      : rows;
    return [...list].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name, "he");
    });
  }, [rows, categoryFilter]);

  const activeCategory = categoryFilter
    ? sortedCategories.find((category) => category.id === categoryFilter)
    : null;

  useEffect(() => {
    setRows(items);
  }, [items]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const close = () => {
    setDraft(null);
    setSlugTouched(false);
    setSmartPasteOpen(false);
    setError(null);
  };

  const handleDelete = (item: MenuItem) => {
    if (!confirmDelete(item.name)) return;
    run(async () => {
      await deleteMenuItemAction(item.id);
      setRows((prev) => prev.filter((row) => row.id !== item.id));
    });
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    void uploadDraftImage(event, "primary");
  };

  const handleCloseUpImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    void uploadDraftImage(event, "closeUp");
  };

  const uploadDraftImage = async (
    event: ChangeEvent<HTMLInputElement>,
    target: "primary" | "closeUp"
  ) => {
    const file = event.target.files?.[0];
    if (!file || !draft) return;

    const setUploading = target === "primary" ? setUploadingImage : setUploadingCloseUpImage;
    setUploading(true);
    setError(null);
    try {
      const dataUrl =
        target === "closeUp"
          ? await compressMenuCloseUpImage(file)
          : await compressMenuPrimaryImage(file);
      const response = await fetch("/api/admin/menu-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ dataUrl })
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
      setDraft((prev) => {
        if (!prev) return prev;
        if (target === "closeUp") {
          return { ...prev, closeUpImageUrl: uploadedUrl };
        }

        return { ...prev, imageUrl: uploadedUrl };
      });
    } catch (err) {
      console.error("[AdminMenuTable] image upload failed:", err);
      const message =
        err instanceof Error && err.message && !/digest|Server Components/i.test(err.message)
          ? err.message
          : "העלאת התמונה נכשלה. נסו קובץ JPG או PNG.";
      setError(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const menuImageSrc = (url: string, updatedAt?: string) => {
    if (url.startsWith("data:") || url.includes("?")) {
      return url;
    }
    if (updatedAt) {
      return `${url}?v=${encodeURIComponent(updatedAt)}`;
    }
    return url;
  };

  const openNewItem = () => {
    const item = newMenuItem(categories, rows);
    if (categoryFilter) {
      const inCategory = rows.filter((row) => row.categoryId === categoryFilter);
      item.categoryId = categoryFilter;
      item.sortOrder =
        inCategory.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 1;
    }
    setSlugTouched(false);
    setDraft(item);
  };

  const openEditItem = (item: MenuItem) => {
    setSlugTouched(Boolean(item.slug?.trim()));
    setDraft({
      ...item,
      longDescription: item.longDescription ?? "",
      slug: item.slug ?? "",
      imageAlt: item.imageAlt ?? "",
      closeUpImageUrl: item.closeUpImageUrl ?? "",
      primaryKeyword: item.primaryKeyword ?? "",
      metaTitle: item.metaTitle ?? "",
      metaDescription: item.metaDescription ?? ""
    });
  };

  const updateName = (name: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next: MenuItem = { ...prev, name };
      if (!slugTouched) {
        next.slug =
          slugifyProductName(name) ||
          resolveMenuItemSlug({ id: prev.id, name, slug: undefined });
      }
      return next;
    });
  };

  return (
    <>
      {toastMessage ? (
        <div className="admin-toast" role="status">
          {toastMessage}
        </div>
      ) : null}

      <nav className="admin-menu-category-nav" aria-label="סינון לפי קטגוריה">
        <button
          type="button"
          className={`admin-menu-category-chip${categoryFilter === null ? " is-active" : ""}`}
          aria-pressed={categoryFilter === null}
          onClick={() => setCategoryFilter(null)}
        >
          הכל
          <span className="admin-menu-category-count">{rows.length}</span>
        </button>
        {sortedCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`admin-menu-category-chip${categoryFilter === category.id ? " is-active" : ""}`}
            aria-pressed={categoryFilter === category.id}
            onClick={() => setCategoryFilter(category.id)}
          >
            {category.name}
            <span className="admin-menu-category-count">{countByCategory[category.id] ?? 0}</span>
          </button>
        ))}
      </nav>

      <AdminToolbar
        label={activeCategory ? `הוסף מנה ל־${activeCategory.name}` : "הוסף מנה"}
        onAdd={openNewItem}
      />

      {activeCategory ? (
        <p className="admin-menu-filter-hint muted">
          מציג {filteredRows.length} מנות בקטגוריה «{activeCategory.name}» — לפי סדר תצוגה
        </p>
      ) : null}

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 56 }}>סדר</th>
            <th style={{ width: 72 }}>תמונה</th>
            <th>מנה</th>
            {!categoryFilter ? <th>קטגוריה</th> : null}
            <th>מחיר</th>
            <th>סטטוס</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.length === 0 ? (
            <tr>
              <td className="admin-menu-empty" colSpan={categoryFilter ? 6 : 7}>
                {activeCategory
                  ? `אין מנות בקטגוריה «${activeCategory.name}». לחץ «הוסף מנה ל־${activeCategory.name}».`
                  : "אין מנות בתפריט."}
              </td>
            </tr>
          ) : (
            filteredRows.map((item) => (
              <tr key={item.id}>
                <td className="admin-menu-sort">{item.sortOrder}</td>
                <td>
                  <img
                    alt={resolveMenuItemImageAlt(item, "he")}
                    className="admin-menu-thumb"
                    height={56}
                    src={menuImageSrc(item.imageUrl, item.updatedAt)}
                    width={56}
                    loading="lazy"
                  />
                </td>
                <td>
                  <strong>{item.name}</strong>
                  <p className="muted" style={{ margin: "6px 0 0", maxWidth: 420 }}>
                    {item.description}
                  </p>
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
                    {getMenuItemHref(item)}
                  </p>
                </td>
                {!categoryFilter ? <td>{categoryById[item.categoryId] ?? "—"}</td> : null}
                <td>{item.price} ש&quot;ח</td>
                <td>
                  <StatusBadge active={item.isActive} />
                </td>
                <td>
                  <AdminRowActions
                    disabled={isPending}
                    onDelete={() => handleDelete(item)}
                    onEdit={() => openEditItem(item)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <AdminModal open={Boolean(draft)} title={isNew ? "הוספת מנה" : "עריכת מנה"} onClose={close}>
        {draft ? (
          <form
            ref={formRef}
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                const result = await saveMenuItemViaApi(draft);
                if (!result.ok) {
                  throw new Error(result.error);
                }
                const saved = result.item;
                setDraft((prev) => (prev ? { ...prev, ...saved } : prev));
                setRows((prev) => {
                  const idx = prev.findIndex((row) => row.id === saved.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = saved;
                    return next;
                  }
                  return [...prev, saved];
                });
              }, close);
            }}
          >
            <div className="admin-form-toolbar">
              <button
                type="button"
                className="button secondary"
                onClick={() => setSmartPasteOpen(true)}
              >
                הדבקה חכמה
              </button>
            </div>

            <label>
              {adminFieldLabel("שם המנה", "כותרת בעמוד המוצר + שם בכרטיס ב-/menu")}
              <input
                required
                maxLength={120}
                value={draft.name}
                onChange={(e) => updateName(e.target.value)}
              />
            </label>
            <label>
              {adminFieldLabel("קטגוריה", "מיקום וסינון ב-/menu — לא טקסט גלוי")}
              <select
                required
                value={draft.categoryId}
                onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {adminFieldLabel('מחיר (ש"ח)', "מחיר בכרטיס ב-/menu")}
              <input
                min={0}
                step={0.01}
                type="number"
                required
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })}
              />
            </label>
            <label>
              {adminFieldLabel("תיאור קצר", "מתחת לכותרת בעמוד המוצר /menu/[slug]")}
              <textarea
                rows={3}
                maxLength={500}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </label>

            <fieldset className="admin-seo-fieldset">
              <legend>תוכן SEO</legend>
              <label>
                {adminFieldLabel("תיאור ארוך (גוף העמוד)", "גוף העמוד /menu/[slug]")}
                <textarea
                  rows={5}
                  maxLength={4000}
                  value={draft.longDescription ?? ""}
                  onChange={(e) => setDraft({ ...draft, longDescription: e.target.value })}
                />
              </label>
              <label>
                {adminFieldLabel("טקסט ALT לתמונה (אופציונלי)", "תיאור תמונה לנגישות — בכל האתר")}
                <input
                  maxLength={160}
                  placeholder="נוצר אוטומטית אם ריק"
                  value={draft.imageAlt ?? ""}
                  onChange={(e) => setDraft({ ...draft, imageAlt: e.target.value })}
                />
              </label>
              <label>
                {adminFieldLabel("מילת מפתח ראשית", "שמירה פנימית — לא מוצג באתר")}
                <input
                  maxLength={80}
                  value={draft.primaryKeyword ?? ""}
                  onChange={(e) => setDraft({ ...draft, primaryKeyword: e.target.value })}
                />
              </label>
              <label>
                {adminFieldLabel("כותרת מטא (עד 60)", "כותרת ב-Google + לשונית הדפדפן")}
                <input
                  maxLength={60}
                  value={draft.metaTitle ?? ""}
                  onChange={(e) => setDraft({ ...draft, metaTitle: e.target.value })}
                />
              </label>
              <p className="muted" style={{ marginTop: -8 }}>
                {(draft.metaTitle ?? "").length}/60
              </p>
              <label>
                {adminFieldLabel("תיאור מטא (עד 160)", "תיאור ב-Google")}
                <textarea
                  rows={3}
                  maxLength={160}
                  value={draft.metaDescription ?? ""}
                  onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })}
                />
              </label>
              <p className="muted" style={{ marginTop: -8 }}>
                {(draft.metaDescription ?? "").length}/160
              </p>
            </fieldset>

            <label>
              {adminFieldLabel("סלאג (כתובת העמוד)", "כתובת /menu/[slug]")}
              <input
                maxLength={80}
                value={draft.slug ?? ""}
                placeholder="נוצר אוטומטית משם המנה"
                onChange={(e) => {
                  setSlugTouched(true);
                  setDraft({ ...draft, slug: e.target.value });
                }}
              />
            </label>
            <p className="muted" style={{ marginTop: -8 }}>
              כתובת ציבורית: {getMenuItemHref(draft)}
            </p>

            <label>
              {adminFieldLabel("תמונה ראשית (מוצגת בכל האתר)", "/menu, דף הבית, עמוד המוצר")}
              <input accept="image/*" disabled={uploadingImage} type="file" onChange={handleImageUpload} />
            </label>
            <p className="admin-image-spec">
              גודל מומלץ: 1200×1200px (1:1) · עד 80KB — נדחס אוטומטית בהעלאה
            </p>
            {uploadingImage ? <p className="muted">דוחס תמונה ראשית עד 80KB…</p> : null}
            {draft.imageUrl ? (
              <div className="admin-image-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={resolveMenuItemImageAlt(draft, "he")}
                  height={120}
                  src={menuImageSrc(draft.imageUrl, draft.updatedAt)}
                  width={120}
                />
                <p className="muted">התמונה נשמרת אוטומטית לאחר העלאה — לחצו שמור לשייך למנה</p>
              </div>
            ) : null}

            <label>
              {adminFieldLabel("תמונה מקרוב מוצר (מוצגת רק בעמוד המוצר)", "עמוד המוצר /menu/[slug] בלבד")}
              <input
                accept="image/*"
                disabled={uploadingCloseUpImage}
                type="file"
                onChange={handleCloseUpImageUpload}
              />
            </label>
            <p className="admin-image-spec">
              גודל מומלץ: 960×960px (1:1) · עד 40KB — נדחס אוטומטית בהעלאה
            </p>
            {uploadingCloseUpImage ? <p className="muted">דוחס תמונת מקרוב עד 40KB…</p> : null}
            {draft.closeUpImageUrl?.trim() ? (
              <div className="admin-image-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={resolveMenuItemCloseUpAlt(draft, "he")}
                  height={120}
                  src={menuImageSrc(draft.closeUpImageUrl, draft.updatedAt)}
                  width={120}
                />
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setDraft((prev) => (prev ? { ...prev, closeUpImageUrl: "" } : prev))}
                >
                  הסר תמונת מקרוב
                </button>
              </div>
            ) : (
              <p className="muted">אופציונלי — תופיע לצד התמונה הראשית בעמוד המוצר בלבד.</p>
            )}

            <label>
              {adminFieldLabel("סדר תצוגה", "סדר המנה בתוך הקטגוריה ב-/menu")}
              <input
                min={0}
                type="number"
                value={draft.sortOrder}
                onChange={(e) => setDraft({ ...draft, sortOrder: parseInt(e.target.value, 10) || 0 })}
              />
            </label>
            <label className="admin-checkbox-row">
              <input
                checked={draft.isActive}
                type="checkbox"
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              />
              <span>{adminFieldLabel("מנה פעילה", "הצגה / הסתרה באתר")}</span>
            </label>
            <AdminFormFooter error={error} isPending={isPending} onCancel={close} />
          </form>
        ) : null}
      </AdminModal>

      {draft ? (
        <AdminMenuItemSmartPasteModal
          open={smartPasteOpen}
          draft={draft}
          categories={sortedCategories}
          onClose={() => setSmartPasteOpen(false)}
          onApply={(nextDraft, nextSlugTouched, warnings) => {
            setDraft(nextDraft);
            if (nextSlugTouched) {
              setSlugTouched(true);
            }
            setToastMessage(
              warnings.length > 0
                ? `השדות מולאו. ${warnings[0]}`
                : "השדות מולאו בהצלחה. ניתן לעבור עליהם ולשמור."
            );
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      ) : null}
    </>
  );
}
