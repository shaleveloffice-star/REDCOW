"use client";

import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { resolveMenuItemMediaUrl } from "@/lib/menu/normalize-menu";
import { saveHomepageMenuShowcaseAction } from "@/server/actions/menu.actions";
import type { MenuCategory, MenuItem } from "@/types/content";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const PLACEHOLDER_IMAGE = "/images/menu/nb-menu-burger.png";

type AdminHomepageMenuShowcaseProps = {
  items: MenuItem[];
  categories: MenuCategory[];
  initialItemIds: string[];
  isConfigured: boolean;
};

function moveItemById(ids: string[], itemId: string, direction: -1 | 1) {
  const index = ids.indexOf(itemId);
  if (index < 0) {
    return ids;
  }
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= ids.length) {
    return ids;
  }
  const next = [...ids];
  const [row] = next.splice(index, 1);
  next.splice(nextIndex, 0, row);
  return next;
}

function reorderItem(ids: string[], draggedId: string, targetId: string) {
  if (draggedId === targetId) {
    return ids;
  }
  const from = ids.indexOf(draggedId);
  const to = ids.indexOf(targetId);
  if (from < 0 || to < 0) {
    return ids;
  }
  const next = [...ids];
  next.splice(from, 1);
  next.splice(to, 0, draggedId);
  return next;
}

export function AdminHomepageMenuShowcase({
  items,
  categories,
  initialItemIds,
  isConfigured
}: AdminHomepageMenuShowcaseProps) {
  const { isPending, error, setError, run } = useAdminMutation();
  const [orderedIds, setOrderedIds] = useState(initialItemIds);
  const [pickerId, setPickerId] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    setOrderedIds(initialItemIds);
  }, [initialItemIds]);

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "he")
      ),
    [categories]
  );

  const itemsByCategory = useMemo(() => {
    const groups = sortedCategories.map((category) => ({
      category,
      items: items
        .filter((item) => item.isActive && item.categoryId === category.id)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "he"))
    }));

    const knownCategoryIds = new Set(categories.map((category) => category.id));
    const uncategorized = items
      .filter((item) => item.isActive && !knownCategoryIds.has(item.categoryId))
      .sort((a, b) => a.name.localeCompare(b.name, "he"));

    if (uncategorized.length > 0) {
      groups.push({
        category: {
          id: "__uncategorized__",
          name: "ללא קטגוריה",
          slug: "",
          sortOrder: 9999,
          isActive: true,
          createdAt: "",
          updatedAt: ""
        },
        items: uncategorized
      });
    }

    return groups.filter((group) => group.items.length > 0);
  }, [categories, items, sortedCategories]);

  const availableItems = useMemo(
    () => items.filter((item) => item.isActive && !orderedIds.includes(item.id)),
    [items, orderedIds]
  );

  const activeItemCount = useMemo(() => items.filter((item) => item.isActive).length, [items]);

  const selectedItems = orderedIds
    .map((id) => itemsById.get(id))
    .filter((item): item is MenuItem => Boolean(item));

  const selectedIndexById = useMemo(() => {
    const map = new Map<string, number>();
    orderedIds.forEach((id, index) => map.set(id, index));
    return map;
  }, [orderedIds]);

  return (
    <section className="admin-homepage-showcase">
      <p className="admin-homepage-showcase-lead">
        בחרו אילו מנות יופיעו בדף הבית בסקשן &quot;התפריט שלנו&quot; — לפי הסדר. גררו שורה, השתמשו
        בחצים, או הוסיפו מהרשימה. אין צורך לפתוח כרטיס עריכה לכל מנה.
      </p>
      {!isConfigured ? (
        <p className="admin-homepage-showcase-note">
          עדיין לא נשמר סדר ייעודי — מוצג כרגע מה שמופיע למטה. לחצו &quot;שמור תצוגת דף בית&quot; כדי
          לקבע.
        </p>
      ) : null}

      <ol className="admin-homepage-showcase-list">
        {selectedItems.length === 0 ? (
          <li className="admin-homepage-showcase-empty">אין מנות נבחרות — הוסיפו מהרשימה למטה.</li>
        ) : (
          selectedItems.map((item) => {
            const index = selectedIndexById.get(item.id) ?? 0;
            const imageSrc = resolveMenuItemMediaUrl(item.imageUrl, PLACEHOLDER_IMAGE);
            const isDragging = draggingId === item.id;

            return (
              <li
                key={item.id}
                className={`admin-homepage-showcase-row${isDragging ? " is-dragging" : ""}`}
                draggable
                onDragEnd={() => setDraggingId(null)}
                onDragStart={() => setDraggingId(item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (!draggingId) return;
                  setOrderedIds((current) => reorderItem(current, draggingId, item.id));
                  setDraggingId(null);
                }}
              >
                <button
                  className="admin-homepage-showcase-drag"
                  type="button"
                  aria-label={`גרור את ${item.name}`}
                  onMouseDown={() => setDraggingId(item.id)}
                >
                  ⋮⋮
                </button>
                <span className="admin-homepage-showcase-order">{index + 1}</span>
                <div className="admin-homepage-showcase-thumb">
                  <Image src={imageSrc} alt="" width={56} height={56} unoptimized />
                </div>
                <div className="admin-homepage-showcase-copy">
                  <strong>{item.name}</strong>
                  <span>{categoriesById.get(item.categoryId) ?? "—"}</span>
                </div>
                <div className="admin-homepage-showcase-actions">
                  <button
                    className="button secondary"
                    disabled={index === 0}
                    type="button"
                    aria-label="הזז למעלה"
                    onClick={() =>
                      setOrderedIds((current) => moveItemById(current, item.id, -1))
                    }
                  >
                    ↑
                  </button>
                  <button
                    className="button secondary"
                    disabled={index === orderedIds.length - 1}
                    type="button"
                    aria-label="הזז למטה"
                    onClick={() => setOrderedIds((current) => moveItemById(current, item.id, 1))}
                  >
                    ↓
                  </button>
                  <button
                    className="button secondary admin-btn-danger"
                    type="button"
                    onClick={() => setOrderedIds((current) => current.filter((id) => id !== item.id))}
                  >
                    הסר
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ol>

      <div className="admin-homepage-showcase-add">
        <label>
          הוסף מנה לדף הבית
          <select
            value={pickerId}
            disabled={isPending || activeItemCount === 0}
            onChange={(e) => setPickerId(e.target.value)}
          >
            <option value="">
              {availableItems.length === 0
                ? "כל המנות הפעילות כבר ברשימה"
                : `בחרו מנה… (${availableItems.length} זמינות מתוך ${activeItemCount})`}
            </option>
            {itemsByCategory.map(({ category, items: groupItems }) => (
              <optgroup key={category.id} label={category.name}>
                {groupItems.map((item) => {
                  const isSelected = orderedIds.includes(item.id);
                  return (
                    <option key={item.id} disabled={isSelected} value={item.id}>
                      {item.name}
                      {isSelected ? " — כבר בדף הבית" : ""}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </label>
        <button
          className="button secondary"
          disabled={isPending || !pickerId || orderedIds.includes(pickerId)}
          type="button"
          onClick={() => {
            if (!pickerId || orderedIds.includes(pickerId)) return;
            setOrderedIds((current) => [...current, pickerId]);
            setPickerId("");
          }}
        >
          הוסף
        </button>
      </div>

      {error ? <p className="admin-form-error">{error}</p> : null}

      <div className="admin-form-actions">
        <button
          className="button"
          disabled={isPending}
          type="button"
          onClick={() => {
            setError(null);
            run(async () => {
              await saveHomepageMenuShowcaseAction(orderedIds);
            });
          }}
        >
          {isPending ? "שומר…" : "שמור תצוגת דף בית"}
        </button>
      </div>
    </section>
  );
}
