"use client";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { createId } from "@/lib/admin/new-id";
import { compressImageFileToDataUrl } from "@/lib/client/compress-image";
import { getMenuItemHref, slugifyProductName } from "@/lib/menu/product-slug";
import { deleteMenuItemAction } from "@/server/actions/menu.actions";
import type { MenuCategory, MenuItem } from "@/types/content";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";

type SaveMenuItemApiResult =
  | { ok: true; item: MenuItem }
  | { ok: false; error: string };

async function saveMenuItemViaApi(item: MenuItem): Promise<SaveMenuItemApiResult> {
  let imageUrl = item.imageUrl;
  if (imageUrl.startsWith("data:image/")) {
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
        error: `העלאת התמונה נכשלה לפני השמירה (${uploadResponse.status}).`
      };
    }
    if (!uploadResult.ok) {
      return { ok: false, error: uploadResult.error };
    }
    imageUrl = uploadResult.url;
  }

  const response = await fetch("/api/admin/menu-item", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ ...item, imageUrl })
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
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const close = () => {
    setDraft(null);
    setSlugTouched(false);
    setError(null);
  };

  const handleDelete = (item: MenuItem) => {
    if (!confirmDelete(item.name)) return;
    run(async () => {
      await deleteMenuItemAction(item.id);
      setRows((prev) => prev.filter((row) => row.id !== item.id));
    });
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !draft) return;

    setUploadingImage(true);
    setError(null);
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
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
        const nextAlt = prev.imageAlt?.trim() ? prev.imageAlt : prev.name.trim() || prev.imageAlt;
        return { ...prev, imageUrl: uploadedUrl, imageAlt: nextAlt ?? "" };
      });
    } catch (err) {
      console.error("[AdminMenuTable] image upload failed:", err);
      const message =
        err instanceof Error && err.message && !/digest|Server Components/i.test(err.message)
          ? err.message
          : "העלאת התמונה נכשלה. נסו קובץ JPG או PNG.";
      setError(message);
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const menuImageSrc = (item: MenuItem) => {
    if (item.imageUrl.startsWith("data:") || item.imageUrl.includes("?")) {
      return item.imageUrl;
    }
    return `${item.imageUrl}?v=${encodeURIComponent(item.updatedAt)}`;
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
        next.slug = slugifyProductName(name);
      }
      if (!prev.imageAlt?.trim()) {
        next.imageAlt = name;
      }
      return next;
    });
  };

  return (
    <>
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
                    alt={item.imageAlt || item.name}
                    className="admin-menu-thumb"
                    height={56}
                    src={menuImageSrc(item)}
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
            <label>
              שם המנה
              <input
                required
                maxLength={120}
                value={draft.name}
                onChange={(e) => updateName(e.target.value)}
              />
            </label>
            <label>
              קטגוריה
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
              מחיר (ש&quot;ח)
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
              תיאור קצר
              <textarea
                rows={3}
                maxLength={500}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </label>
            <label>
              תיאור ארוך
              <textarea
                rows={5}
                maxLength={4000}
                value={draft.longDescription ?? ""}
                onChange={(e) => setDraft({ ...draft, longDescription: e.target.value })}
              />
            </label>
            <label>
              סלאג (כתובת העמוד)
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
              תמונת מנה (מהמחשב)
              <input accept="image/*" disabled={uploadingImage} type="file" onChange={handleImageUpload} />
            </label>
            {uploadingImage ? <p className="muted">דוחס ומכין תמונה…</p> : null}
            {draft.imageUrl ? (
              <div className="admin-image-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={draft.imageAlt || draft.name || ""}
                  height={120}
                  src={menuImageSrc(draft)}
                  width={120}
                />
                <p className="muted">התמונה נשמרת אוטומטית לאחר העלאה — לחצו שמור לשייך למנה</p>
              </div>
            ) : null}
            <label>
              טקסט ALT לתמונה
              <input
                required={Boolean(draft.imageUrl)}
                maxLength={160}
                value={draft.imageAlt ?? ""}
                onChange={(e) => setDraft({ ...draft, imageAlt: e.target.value })}
              />
            </label>

            <label>
              מילת מפתח ראשית (SEO)
              <input
                maxLength={80}
                value={draft.primaryKeyword ?? ""}
                onChange={(e) => setDraft({ ...draft, primaryKeyword: e.target.value })}
              />
            </label>
            <label>
              כותרת מטא (עד 60)
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
              תיאור מטא (עד 160)
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

            <label>
              סדר תצוגה
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
              <span>מנה פעילה</span>
            </label>
            <AdminFormFooter error={error} isPending={isPending} onCancel={close} />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
