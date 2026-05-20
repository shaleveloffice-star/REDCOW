"use client";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { createId } from "@/lib/admin/new-id";
import { deleteContactMessageAction, saveContactMessageAction } from "@/server/actions/contact.actions";
import type { ContactMessage, RecordStatus } from "@/types/content";
import { useState } from "react";

const STATUS_OPTIONS: RecordStatus[] = ["new", "inReview", "resolved", "archived"];

function newMessage(): ContactMessage {
  const now = new Date().toISOString();
  return {
    id: createId("message"),
    fullName: "",
    phone: "",
    email: "",
    message: "",
    createdAt: now,
    status: "new"
  };
}

export function AdminContactMessagesManager({ messages }: { messages: ContactMessage[] }) {
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<ContactMessage | null>(null);
  const isNew = draft ? !messages.some((m) => m.id === draft.id) : false;

  const close = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <>
      <AdminToolbar label="הוסף הודעה ידנית" onAdd={() => setDraft(newMessage())} />
      <table className="table">
        <thead>
          <tr>
            <th>שם</th>
            <th>פרטי קשר</th>
            <th>הודעה</th>
            <th>סטטוס</th>
            <th style={{ width: 160 }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr key={message.id}>
              <td>{message.fullName}</td>
              <td>
                {message.phone}
                <br />
                {message.email}
              </td>
              <td>{message.message}</td>
              <td>{message.status}</td>
              <td>
                <AdminRowActions
                  disabled={isPending}
                  onDelete={() => {
                    if (!confirmDelete(message.fullName)) return;
                    run(async () => {
                      await deleteContactMessageAction(message.id);
                    });
                  }}
                  onEdit={() => setDraft({ ...message })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdminModal open={Boolean(draft)} title={isNew ? "הוספת הודעה" : "עריכת הודעה"} onClose={close}>
        {draft ? (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await saveContactMessageAction(draft);
              }, close);
            }}
          >
            <label>
              שם מלא
              <input required value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} />
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
              <textarea required rows={4} value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} />
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
