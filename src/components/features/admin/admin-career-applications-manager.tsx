"use client";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { createId } from "@/lib/admin/new-id";
import { deleteCareerApplicationAction, saveCareerApplicationAction, setCareerApplicationHandledAction } from "@/server/actions/careers.actions";
import { CAREER_STATUS_LABELS, formatCareerApplications } from "@/lib/careers/application-copy";
import styles from "./career-applications.module.css";
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copyMessage, setCopyMessage] = useState("");
  const selected = applications.filter(application => selectedIds.includes(application.id));
  const allSelected = applications.length > 0 && selected.length === applications.length;
  const isNew = draft ? !applications.some((a) => a.id === draft.id) : false;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <>
      <AdminToolbar label="הוסף פנייה ידנית" onAdd={() => setDraft(newApplication())} />
      <div className={styles.toolbar}>
        <label><input type="checkbox" checked={allSelected} disabled={!applications.length}
          onChange={event => { setSelectedIds(event.target.checked ? applications.map(application => application.id) : []); setCopyMessage(""); }} />בחירת הכול</label>
        <button type="button" disabled={!selected.length} onClick={async () => {
          try {
            await navigator.clipboard.writeText(formatCareerApplications(selected));
            setCopyMessage(`הועתקו פרטים של ${selected.length} פניות`);
          } catch { setCopyMessage("לא ניתן להעתיק ללוח. אפשרו הרשאת העתקה בדפדפן ונסו שוב."); }
        }}>העתקת פרטים ({selected.length})</button>
        <button type="button" disabled={!selected.length} onClick={() => { setSelectedIds([]); setCopyMessage(""); }}>ביטול הבחירה</button>
        <span role="status">{copyMessage}</span>
      </div>
      {!draft && error ? <p role="alert">{error}</p> : null}
      <div className={styles.tableScroll}>
      <table className="table">
        <thead>
          <tr>
            <th>בחירה</th>
            <th>שם</th>
            <th>מגורים / גיל / ניסיון</th>
            <th>תפקיד מבוקש</th>
            <th>פרטי קשר</th>
            <th>סטטוס</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id} className={application.status === "resolved" ? styles.handled : undefined}>
              <td><input type="checkbox" aria-label={`בחירת הפנייה של ${application.fullName}`} checked={selectedIds.includes(application.id)}
                onChange={event => { setSelectedIds(ids => event.target.checked ? [...ids, application.id] : ids.filter(id => id !== application.id)); setCopyMessage(""); }} /></td>
              <td>{application.fullName}</td>
              <td>
                {application.residenceArea || "לא צוין"}<br />
                {application.age !== undefined ? `גיל: ${application.age}` : "גיל לא צוין"}<br />
                {application.hasExperience === undefined ? "ניסיון לא צוין" : application.hasExperience ? "יש ניסיון קודם" : "ללא ניסיון"}
              </td>
              <td>{application.desiredRole}</td>
              <td>
                {application.phone}
                <br />
                {application.email}
              </td>
              <td className={styles.status}>{CAREER_STATUS_LABELS[application.status]}</td>
              <td>
                <button type="button" className={styles.handleButton} disabled={isPending}
                  onClick={() => run(async () => { await setCareerApplicationHandledAction(application.id, application.status !== "resolved"); })}>
                  {application.status === "resolved" ? "החזר לחדש" : "סמן כטופל"}
                </button>
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
      </div>

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
              <input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </label>
            <label>
              אזור מגורים
              <input maxLength={120} value={draft.residenceArea ?? ""} onChange={(e) => setDraft({ ...draft, residenceArea: e.target.value })} />
            </label>
            <label>
              גיל
              <input type="number" min={1} max={120} step={1} value={draft.age ?? ""} onChange={(e) => setDraft({ ...draft, age: e.target.value === "" ? undefined : Number(e.target.value) })} />
            </label>
            <label>
              ניסיון קודם
              <select value={draft.hasExperience === undefined ? "" : draft.hasExperience ? "yes" : "no"} onChange={(e) => setDraft({ ...draft, hasExperience: e.target.value === "" ? undefined : e.target.value === "yes" })}>
                <option value="">לא צוין</option><option value="yes">יש ניסיון קודם</option><option value="no">אין ניסיון</option>
              </select>
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
                    {CAREER_STATUS_LABELS[s]}
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
