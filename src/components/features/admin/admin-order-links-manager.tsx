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
import { deleteOrderLinkAction, saveOrderLinkAction } from "@/server/actions/order-links.actions";
import type { OrderLink } from "@/types/content";
import { useState } from "react";

function newLink(links: OrderLink[]): OrderLink {
  const now = new Date().toISOString();
  return {
    id: createId("order"),
    label: "",
    type: "delivery",
    url: "",
    sortOrder: links.length + 1,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
}

export function AdminOrderLinksManager({ links }: { links: OrderLink[] }) {
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<OrderLink | null>(null);
  const isNew = draft ? !links.some((l) => l.id === draft.id) : false;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <>
      <AdminToolbar label="הוסף קישור" onAdd={() => setDraft(newLink(links))} />
      <table className="table">
        <thead>
          <tr>
            <th>שם</th>
            <th>סוג</th>
            <th>URL</th>
            <th>סטטוס</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.id}>
              <td>{link.label}</td>
              <td>{link.type}</td>
              <td>{link.url}</td>
              <td>
                <StatusBadge active={link.isActive} />
              </td>
              <td>
                <AdminRowActions
                  disabled={isPending}
                  onDelete={() => {
                    if (!confirmDelete(link.label)) return;
                    run(async () => {
                      await deleteOrderLinkAction(link.id);
                    });
                  }}
                  onEdit={() => setDraft({ ...link })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminModal open={Boolean(draft)} title={isNew ? "הוספת קישור" : "עריכת קישור"} onClose={close}>
        {draft ? (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await saveOrderLinkAction(draft);
              }, close);
            }}
          >
            <label>
              שם
              <input required value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            </label>
            <label>
              סוג
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as OrderLink["type"] })}>
                <option value="delivery">משלוחים</option>
                <option value="pickup">איסוף</option>
                <option value="marketplace">שוק מקוון</option>
              </select>
            </label>
            <label>
              URL
              <input required type="url" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
            </label>
            <label>
              סדר
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
              <span>פעיל</span>
            </label>
            <AdminFormFooter error={error} isPending={isPending} onCancel={close} />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
