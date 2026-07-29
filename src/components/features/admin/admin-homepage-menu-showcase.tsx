"use client";

import { useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { resolveMenuItemMediaUrl } from "@/lib/menu/normalize-menu";
import { saveHomepageMenuShowcaseAction } from "@/server/actions/menu.actions";
import type { MenuCategory, MenuItem } from "@/types/content";
import Image from "next/image";
import { useMemo, useState } from "react";

const PLACEHOLDER_IMAGE = "/images/menu/nb-menu-burger.png";

type AdminHomepageMenuShowcaseProps = {
  items: MenuItem[];
  categories: MenuCategory[];
  initialItemIds: string[];
  isConfigured: boolean;
};

function moveItem(ids: string[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= ids.length) {
    return ids;
  }
  const next = [...ids];
  const [row] = next.splice(index, 1);
  next.splice(nextIndex, 0, row);
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

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const availableItems = useMemo(
    () =>
      items
        .filter((item) => item.isActive && !orderedIds.includes(item.id))
        .sort((a, b) => {
          const catA = categoriesById.get(a.categoryId) ?? "";
          const catB = categoriesById.get(b.categoryId) ?? "";
          if (catA !== catB) return catA.localeCompare(catB, "he");
          return a.name.localeCompare(b.name, "he");
        }),
    [categoriesById, items, orderedIds]
  );

  const selectedItems = orderedIds
    .map((id) => itemsById.get(id))
    .filter((item): item is MenuItem => Boolean(item));

  return (
    <section className="admin-homepage-showcase">
      <p className="admin-homepage-showcase-lead">
        בחרו אילו מנות יופיעו בדף הבית בסקשן &quot;התפריט שלנו&quot; — לפי הסדר. אין צורך לפתוח כרטיס
        עריכה לכל מנה.
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
          selectedItems.map((item, index) => {
            const imageSrc = resolveMenuItemMediaUrl(item.imageUrl, PLACEHOLDER_IMAGE);
            return (
              <li key={item.id} className="admin-homepage-showcase-row">
                <span className="admin-homepage-showcase-order">{index + 1}</span>
                <div className="admin-homepage-showcase-thumb">
                  <Image src={imageSrc} alt="" width={56} height={56} unoptimized />
                </div>
                <div className="admin-homepage-showcase-copy">
                  <strong>{item.name}</strong>
                  <span>{categoriesById.get(item.categoryId) ?? "—"}</span>
                </div>
                <StatusBadge active={item.isActive} />
                <div className="admin-homepage-showcase-actions">
                  <button
                    className="button secondary"
                    disabled={isPending || index === 0}
                    type="button"
                    aria-label="הזז למעלה"
                    onClick={() => setOrderedIds((current) => moveItem(current, index, -1))}
                  >
                    ↑
                  </button>
                  <button
                    className="button secondary"
                    disabled={isPending || index === selectedItems.length - 1}
                    type="button"
                    aria-label="הזז למטה"
                    onClick={() => setOrderedIds((current) => moveItem(current, index, 1))}
                  >
                    ↓
                  </button>
                  <button
                    className="button secondary admin-btn-danger"
                    disabled={isPending}
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
            disabled={isPending || availableItems.length === 0}
            onChange={(e) => setPickerId(e.target.value)}
          >
            <option value="">
              {availableItems.length === 0 ? "כל המנות הפעילות כבר ברשימה" : "בחרו מנה…"}
            </option>
            {availableItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({categoriesById.get(item.categoryId) ?? "ללא קטגוריה"})
              </option>
            ))}
          </select>
        </label>
        <button
          className="button secondary"
          disabled={isPending || !pickerId}
          type="button"
          onClick={() => {
            if (!pickerId) return;
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
