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
import { useEffect, useState, type ChangeEvent } from "react";

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
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [rows, setRows] = useState(items);
  const [draft, setDraft] = useState<MenuItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const isNew = draft ? !rows.some((i) => i.id === draft.id) : false;

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

  return (
    <>
      <AdminToolbar label="הוסף מנה" onAdd={() => setDraft(newMenuItem(categories, rows))} />
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 72 }}>תמונה</th>
            <th>מנה</th>
            <th>קטגוריה</th>
            <th>מחיר</th>
            <th>סטטוס</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
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
              <td>{categoryById[item.categoryId] ?? "—"}</td>
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
          ))}
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
