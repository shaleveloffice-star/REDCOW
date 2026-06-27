"use client";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { createId } from "@/lib/admin/new-id";
import {
  deleteCustomerClubSignupAction,
  saveCustomerClubSignupAction
} from "@/server/actions/customer-club.actions";
import type { CustomerClubSignup, RecordStatus } from "@/types/content";
import { useState } from "react";

const STATUS_OPTIONS: RecordStatus[] = ["new", "inReview", "resolved", "archived"];

function newSignup(): CustomerClubSignup {
  const now = new Date().toISOString();
  return {
    id: createId("club"),
    fullName: "",
    phone: "",
    email: "",
    birthDate: "",
    marketingConsent: true,
    createdAt: now,
    status: "new"
  };
}

export function AdminCustomerClubManager({ signups }: { signups: CustomerClubSignup[] }) {
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<CustomerClubSignup | null>(null);
  const isNew = draft ? !signups.some((item) => item.id === draft.id) : false;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <>
      <AdminToolbar label="הוסף הרשמה ידנית" onAdd={() => setDraft(newSignup())} />
      <table className="table">
        <thead>
          <tr>
            <th>שם</th>
            <th>פרטי קשר</th>
            <th>תאריך לידה</th>
            <th>אישור</th>
            <th>סטטוס</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {signups.map((signup) => (
            <tr key={signup.id}>
              <td>{signup.fullName}</td>
              <td>
                {signup.phone}
                <br />
                {signup.email}
              </td>
              <td>{signup.birthDate || "—"}</td>
              <td>{signup.marketingConsent ? "כן" : "לא"}</td>
              <td>{signup.status}</td>
              <td>
                <AdminRowActions
                  disabled={isPending}
                  onDelete={() => {
                    if (!confirmDelete(signup.fullName)) return;
                    run(async () => {
                      await deleteCustomerClubSignupAction(signup.id);
                    });
                  }}
                  onEdit={() => setDraft({ ...signup })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminModal open={Boolean(draft)} title={isNew ? "הוספת הרשמה" : "עריכת הרשמה"} onClose={close}>
        {draft ? (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await saveCustomerClubSignupAction(draft);
              }, close);
            }}
          >
            <label>
              שם מלא
              <input
                required
                value={draft.fullName}
                onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
              />
            </label>
            <label>
              טלפון
              <input
                required
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </label>
            <label>
              אימייל
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </label>
            <label>
              תאריך לידה
              <input
                type="date"
                value={draft.birthDate ?? ""}
                onChange={(e) => setDraft({ ...draft, birthDate: e.target.value })}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={draft.marketingConsent}
                onChange={(e) => setDraft({ ...draft, marketingConsent: e.target.checked })}
              />
              אישור קבלת עדכונים
            </label>
            <label>
              סטטוס
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as RecordStatus })}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <AdminFormFooter error={error} isPending={isPending} onCancel={close} />
          </form>
        ) : null}
      </AdminModal>
    </>
  );
}
