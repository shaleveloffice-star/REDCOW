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
import type { MenuCategory, MenuItem } from "@/types/content";
import { useState } from "react";

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
  const [draft, setDraft] = useState<MenuItem | null>(null);
  const isNew = draft ? !items.some((i) => i.id === draft.id) : false;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  const handleDelete = (item: MenuItem) => {
    if (!confirmDelete(item.name)) return;
    run(async () => {
      await deleteMenuItemAction(item.id);
    });
  };

  return (
    <>
      <AdminToolbar label="הוסף מנה" onAdd={() => setDraft(newMenuItem(categories, items))} />
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
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <img alt="" className="admin-menu-thumb" height={56} src={item.imageUrl} width={56} loading="lazy" />
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
                await saveMenuItemAction(draft);
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
              כתובת תמונה
              <input
                type="text"
                value={draft.imageUrl}
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
