"use client";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { createId } from "@/lib/admin/new-id";
import { deleteCareerApplicationAction, saveCareerApplicationAction } from "@/server/actions/careers.actions";
import type { CareerApplication, RecordStatus } from "@/types/content";
import { useState } from "react";

const STATUS_OPTIONS: RecordStatus[] = ["new", "inReview", "resolved", "archived"];

function newApplication(): CareerApplication {
  const now = new Date().toISOString();
  return {
    id: createId("career"),
    fullName: "",
    phone: "",
    email: "",
    desiredRole: "",
    message: "",
    createdAt: now,
    status: "new"
  };
}

export function AdminCareerApplicationsManager({ applications }: { applications: CareerApplication[] }) {
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<CareerApplication | null>(null);
  const isNew = draft ? !applications.some((a) => a.id === draft.id) : false;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <>
      <AdminToolbar label="הוסף פנייה ידנית" onAdd={() => setDraft(newApplication())} />
      <table className="table">
        <thead>
          <tr>
            <th>שם</th>
            <th>תפקיד מבוקש</th>
            <th>פרטי קשר</th>
            <th>סטטוס</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>{application.fullName}</td>
              <td>{application.desiredRole}</td>
              <td>
                {application.phone}
                <br />
                {application.email}
              </td>
              <td>{application.status}</td>
              <td>
                <AdminRowActions
                  disabled={isPending}
                  onDelete={() => {
                    if (!confirmDelete(application.fullName)) return;
                    run(async () => {
                      await deleteCareerApplicationAction(application.id);
                    });
                  }}
                  onEdit={() => setDraft({ ...application })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminModal open={Boolean(draft)} title={isNew ? "הוספת פנייה" : "עריכת פנייה"} onClose={close}>
        {draft ? (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await saveCareerApplicationAction(draft);
              }, close);
            }}
          >
            <label>
              שם מלא
              <input required value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} />
            </label>
            <label>
              תפקיד מבוקש
              <input required value={draft.desiredRole} onChange={(e) => setDraft({ ...draft, desiredRole: e.target.value })} />
            </label>
            <label>
              טלפון
              <input required value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </label>
            <label>
              אימייל
              <input required type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </label>
            <label>
              הודעה
              <textarea rows={4} value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} />
            </label>
            <label>
              סטטוס
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as RecordStatus })}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
