"use client";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { AdminImageUrlField } from "@/components/features/admin/admin-site-image-picker";
import { StatusBadge } from "@/components/features/admin/status-badge";
import { BRANCH_IMAGE_SPEC } from "@/data/admin-image-specs";
import { createId } from "@/lib/admin/new-id";
import type { AdminPickableImage } from "@/lib/admin/pickable-site-images";
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
    imageUrl: "",
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
}

export function AdminBranchesManager({
  branches,
  images
}: {
  branches: Branch[];
  images: AdminPickableImage[];
}) {
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<Branch | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const isNew = draft ? !branches.some((b) => b.id === draft.id) : false;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <>
      <p className="admin-form-hint">
        סניפים פעילים מוצגים בעמוד המיקומים (`/locations`). לכל סניף אפשר להעלות תמונה שתוצג בכרטיס.
      </p>
      <AdminToolbar label="הוסף סניף" onAdd={() => setDraft(newBranch())} />
      <p className="admin-form-hint" role="status">
        סה״כ סניפים באדמין: {branches.length} · פעילים: {branches.filter((b) => b.isActive).length}
      </p>
      {branches.length === 0 ? (
        <p className="admin-form-hint">עדיין אין סניפים. לחצו „הוסף סניף” כדי ליצור את הראשון.</p>
      ) : null}
      <table className="table">
        <thead>
          <tr>
            <th>תמונה</th>
            <th>סניף</th>
            <th>כתובת</th>
            <th>טלפון</th>
            <th>סטטוס</th>
            <th>קישור</th>
            <th style={{ width: 200 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              <td>
                {branch.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={branch.imageUrl}
                    alt=""
                    width={72}
                    height={48}
                    style={{ objectFit: "cover", borderRadius: 6, display: "block" }}
                  />
                ) : (
                  <span className="admin-form-hint">ברירת מחדל</span>
                )}
              </td>
              <td>
                {branch.name}
                {lastSavedId === branch.id ? (
                  <div className="admin-form-hint" role="status">
                    נשמר עכשיו
                  </div>
                ) : null}
              </td>
              <td>
                {branch.address}, {branch.city}
              </td>
              <td>{branch.phone}</td>
              <td>
                <StatusBadge active={branch.isActive} />
              </td>
              <td>
                <a
                  className="button secondary"
                  href={`/locations#branch-${branch.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  צפייה בעמוד
                </a>
                {!branch.isActive ? (
                  <p className="admin-form-hint" style={{ margin: "6px 0 0" }}>
                    סניף לא פעיל — לא יוצג באתר עד שיסומן פעיל.
                  </p>
                ) : null}
              </td>
              <td>
                <AdminRowActions
                  disabled={isPending}
                  onDelete={() => {
                    if (!confirmDelete(branch.name)) return;
                    run(async () => {
                      await deleteBranchAction(branch.id);
                      setLastSavedId(null);
                    });
                  }}
                  onEdit={() => setDraft({ ...branch, imageUrl: branch.imageUrl ?? "" })}
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
                const saved = await saveBranchAction(draft);
                setLastSavedId(saved.id);
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
              <input
                required
                value={draft.address}
                placeholder="לדוגמה: רחוב אחוזה 96"
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              />
            </label>
            <label>
              טלפון
              <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </label>
            <label>
              שעות פתיחה
              <input
                value={draft.openingHours}
                placeholder="השאירו ריק לשימוש בשעות ברירת המחדל של האתר"
                onChange={(e) => setDraft({ ...draft, openingHours: e.target.value })}
              />
            </label>
            <label>
              קישור Google Maps / ניווט
              <input
                value={draft.wazeUrl}
                placeholder="הדביקו קישור מפות. אפשר להשאיר ריק לסניף הראשי ברעננה"
                onChange={(e) => setDraft({ ...draft, wazeUrl: e.target.value })}
              />
            </label>
            <AdminImageUrlField
              label="תמונת סניף (כרטיס בעמוד המיקומים)"
              value={draft.imageUrl ?? ""}
              images={images}
              spec={BRANCH_IMAGE_SPEC}
              onChange={(imageUrl) => setDraft({ ...draft, imageUrl })}
            />
            <p className="admin-form-hint">
              אם אין תמונה לסניף, יוצגת תמונת החזית הכללית של האתר.
            </p>
            <label className="admin-checkbox-row">
              <input
                checked={draft.isActive}
                type="checkbox"
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              />
              <span>סניף פעיל (מוצג באתר)</span>
            </label>
            <AdminFormFooter error={error} isPending={isPending} onCancel={close} />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
