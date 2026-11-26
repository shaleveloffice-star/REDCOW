"use client";

import { AdminFormFooter, useAdminMutation } from "@/components/features/admin/admin-crud-ui";
import {
  SITE_NAV_ITEM_HREFS,
  SITE_NAV_ITEM_LABELS_HE
} from "@/data/site-nav-defaults";
import { saveSiteNavAction } from "@/server/actions/site-nav.actions";
import type { SiteNavConfig, SiteNavItemId } from "@/types/content";
import { useState } from "react";

function moveItem(ids: SiteNavItemId[], id: SiteNavItemId, delta: number): SiteNavItemId[] {
  const from = ids.indexOf(id);
  if (from < 0) return ids;
  const to = from + delta;
  if (to < 0 || to >= ids.length) return ids;
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function AdminSiteNavManager({ initialConfig }: { initialConfig: SiteNavConfig }) {
  const { isPending, error, setError, run } = useAdminMutation();
  const [itemIds, setItemIds] = useState<SiteNavItemId[]>(initialConfig.itemIds);
  const [draggedId, setDraggedId] = useState<SiteNavItemId | null>(null);
  const [savedHint, setSavedHint] = useState(false);

  const dropBefore = (targetId: SiteNavItemId) => {
    if (!draggedId || draggedId === targetId) return;
    setItemIds((prev) => {
      const without = prev.filter((id) => id !== draggedId);
      const targetIndex = without.indexOf(targetId);
      if (targetIndex < 0) return prev;
      const next = [...without];
      next.splice(targetIndex, 0, draggedId);
      return next;
    });
    setDraggedId(null);
  };

  return (
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSavedHint(false);
        run(async () => {
          const result = await saveSiteNavAction({ itemIds });
          setItemIds(result.config.itemIds);
          setSavedHint(true);
        });
      }}
    >
      <p className="admin-form-hint">
        גררו או השתמשו בחצים כדי לקבוע מה מופיע לפני מה. הסדר נשמר בהדר, בתפריט המובייל ובפוטר.
      </p>
      <p className="admin-form-hint">
        עמודים כבויים (למשל אודות / ממליצים) עדיין יופיעו כאן, אבל יוסתרו באתר עד שיפעילו אותם.
      </p>

      <ul className="admin-site-nav-list">
        {itemIds.map((id, index) => (
          <li
            key={id}
            className={`admin-site-nav-row${draggedId === id ? " is-dragging" : ""}`}
            draggable
            onDragStart={() => setDraggedId(id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropBefore(id)}
          >
            <button
              type="button"
              className="admin-site-nav-drag"
              aria-label={`גרירת ${SITE_NAV_ITEM_LABELS_HE[id]}`}
              title="גרירה לשינוי סדר"
            >
              ⋮⋮
            </button>
            <span className="admin-site-nav-order">{index + 1}</span>
            <div className="admin-site-nav-summary">
              <strong>{SITE_NAV_ITEM_LABELS_HE[id]}</strong>
              <span dir="ltr">{SITE_NAV_ITEM_HREFS[id]}</span>
            </div>
            <div className="admin-site-nav-actions">
              <button
                type="button"
                className="button secondary"
                disabled={index === 0 || isPending}
                onClick={() => setItemIds((prev) => moveItem(prev, id, -1))}
                aria-label="העבר למעלה"
              >
                ↑
              </button>
              <button
                type="button"
                className="button secondary"
                disabled={index === itemIds.length - 1 || isPending}
                onClick={() => setItemIds((prev) => moveItem(prev, id, 1))}
                aria-label="העבר למטה"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>

      {savedHint ? (
        <p className="admin-form-hint" role="status">
          הסדר נשמר ויוצג באתר אחרי רענון.
        </p>
      ) : null}

      <AdminFormFooter
        error={error}
        isPending={isPending}
        onCancel={() => {
          setItemIds(initialConfig.itemIds);
          setError(null);
          setSavedHint(false);
        }}
        submitLabel="שמור סדר"
      />
    </form>
  );
}
