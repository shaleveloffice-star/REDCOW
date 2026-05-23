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
import { deleteMenuItemAction, saveMenuItemAction } from "@/server/actions/menu.actions";
import { uploadMenuImageAction } from "@/server/actions/upload.actions";
import type { MenuCategory, MenuItem } from "@/types/content";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";

function newMenuItem(categories: MenuCategory[], items: MenuItem[]): MenuItem {
  const now = new Date().toISOString();
  return {
    id: createId("item"),
    name: "",
    description: "",
    price: 0,
    categoryId: categories[0]?.id ?? "",
    imageUrl: "/images/menu/placeholder.svg",
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
      const formData = new FormData();
      formData.append("file", file);
      const imageUrl = await uploadMenuImageAction(formData);
      setDraft({ ...draft, imageUrl });
    } catch (err) {
      const message = err instanceof Error ? err.message : "העלאת התמונה נכשלה";
      setError(message);
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const menuImageSrc = (item: MenuItem) =>
    item.imageUrl.includes("?") ? item.imageUrl : `${item.imageUrl}?v=${encodeURIComponent(item.updatedAt)}`;

  const openNewItem = () => {
    const item = newMenuItem(categories, rows);
    if (categoryFilter) {
      const inCategory = rows.filter((row) => row.categoryId === categoryFilter);
      item.categoryId = categoryFilter;
      item.sortOrder =
        inCategory.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 1;
    }
    setDraft(item);
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
                    alt=""
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
                    onEdit={() => setDraft({ ...item })}
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
                const saved = await saveMenuItemAction(draft);
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
              שם
              <input
                required
                maxLength={120}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label>
              תיאור
              <textarea
                rows={4}
                maxLength={500}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
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
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: parseFloat(e.target.value) || 0 })}
              />
            </label>
            <label>
              תמונת מנה
              <input accept="image/*" disabled={uploadingImage} type="file" onChange={handleImageUpload} />
            </label>
            {draft.imageUrl ? (
              <div className="admin-image-preview">
                <img alt="" height={120} src={menuImageSrc(draft)} width={120} />
              </div>
            ) : null}
            <label>
              כתובת תמונה (אופציונלי)
              <input
                type="text"
                value={draft.imageUrl}
                placeholder="/images/menu/your-image.jpg"
                onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
              />
            </label>
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
