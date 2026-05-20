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
import { deleteBranchAction, saveBranchAction } from "@/server/actions/branches.actions";
import type { Branch } from "@/types/content";
import { useState } from "react";

function newBranch(): Branch {
  const now = new Date().toISOString();
  return {
    id: createId("branch"),
    name: "",
    city: "",
    address: "",
    phone: "",
    openingHours: "",
    wazeUrl: "",
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
}

export function AdminBranchesManager({ branches }: { branches: Branch[] }) {
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<Branch | null>(null);
  const isNew = draft ? !branches.some((b) => b.id === draft.id) : false;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <>
      <AdminToolbar label="הוסף סניף" onAdd={() => setDraft(newBranch())} />
      <table className="table">
        <thead>
          <tr>
            <th>סניף</th>
            <th>כתובת</th>
            <th>טלפון</th>
            <th>סטטוס</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              <td>{branch.name}</td>
              <td>
                {branch.address}, {branch.city}
              </td>
              <td>{branch.phone}</td>
              <td>
                <StatusBadge active={branch.isActive} />
              </td>
              <td>
                <AdminRowActions
                  disabled={isPending}
                  onDelete={() => {
                    if (!confirmDelete(branch.name)) return;
                    run(async () => {
                      await deleteBranchAction(branch.id);
                    });
                  }}
                  onEdit={() => setDraft({ ...branch })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminModal open={Boolean(draft)} title={isNew ? "הוספת סניף" : "עריכת סניף"} onClose={close}>
        {draft ? (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await saveBranchAction(draft);
              }, close);
            }}
          >
            <label>
              שם
              <input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label>
              עיר
              <input required value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
            </label>
            <label>
              כתובת
              <input required value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
            </label>
            <label>
              טלפון
              <input required value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </label>
            <label>
              שעות פתיחה
              <input value={draft.openingHours} onChange={(e) => setDraft({ ...draft, openingHours: e.target.value })} />
            </label>
            <label>
              קישור Waze
              <input value={draft.wazeUrl} onChange={(e) => setDraft({ ...draft, wazeUrl: e.target.value })} />
            </label>
            <label className="admin-checkbox-row">
              <input
                checked={draft.isActive}
                type="checkbox"
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              />
              <span>סניף פעיל</span>
            </label>
            <AdminFormFooter error={error} isPending={isPending} onCancel={close} />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
