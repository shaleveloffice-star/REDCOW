"use client";

import {
  AdminFormFooter,
  AdminModal,
  AdminRowActions,
  AdminToolbar,
  useAdminMutation
} from "@/components/features/admin/admin-crud-ui";
import { createId } from "@/lib/admin/new-id";
import { isValidEmailFormat, normalizeEmail } from "@/lib/customer-club/normalize";
import {
  deleteCustomerClubSignupAction,
  saveCustomerClubSignupAction
} from "@/server/actions/customer-club.actions";
import { sendCustomerClubCampaignAction } from "@/server/actions/email-campaigns.actions";
import type { CustomerClubSignup, RecordStatus } from "@/types/content";
import type { EmailCampaign } from "@/types/email-campaign";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS: RecordStatus[] = ["new", "inReview", "resolved", "archived"];

type TabKey = "members" | "history";

function formatSubmittedAt(value?: string): string {
  if (!value?.trim()) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" });
}

function isMailEligible(signup: CustomerClubSignup): boolean {
  const email = normalizeEmail(signup.email ?? "");
  return Boolean(
    email && isValidEmailFormat(email) && signup.marketingConsent && !signup.unsubscribedAt
  );
}

function eligibilityReason(signup: CustomerClubSignup): string {
  const email = normalizeEmail(signup.email ?? "");
  if (!email || !isValidEmailFormat(email)) return "אין אימייל";
  if (signup.unsubscribedAt) return "בוטל דיוור";
  if (!signup.marketingConsent) return "ללא הסכמה";
  return "";
}

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

function statusLabel(status: EmailCampaign["status"]): string {
  switch (status) {
    case "completed":
      return "הושלם";
    case "partial":
      return "חלקי";
    case "failed":
      return "נכשל";
    case "sending":
      return "בשליחה";
    default:
      return status;
  }
}

export function AdminCustomerClubManager({
  signups,
  campaigns
}: {
  signups: CustomerClubSignup[];
  campaigns: EmailCampaign[];
}) {
  const router = useRouter();
  const { isPending, error, setError, run, confirmDelete } = useAdminMutation();
  const [draft, setDraft] = useState<CustomerClubSignup | null>(null);
  const [tab, setTab] = useState<TabKey>("members");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [manualEmails, setManualEmails] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [detailCampaign, setDetailCampaign] = useState<EmailCampaign | null>(null);
  const [sendSummary, setSendSummary] = useState<EmailCampaign | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, startSendTransition] = useTransition();
  const clientRequestIdRef = useRef<string>("");
  const isNew = draft ? !signups.some((item) => item.id === draft.id) : false;

  const eligibleSignups = useMemo(() => signups.filter(isMailEligible), [signups]);
  const eligibleIdSet = useMemo(
    () => new Set(eligibleSignups.map((signup) => signup.id)),
    [eligibleSignups]
  );

  const selectedEligibleIds = useMemo(
    () => [...selectedIds].filter((id) => eligibleIdSet.has(id)),
    [selectedIds, eligibleIdSet]
  );

  const selectedClubCount = selectedEligibleIds.length;
  const manualCount = manualEmails.length;
  const totalRecipients = selectedClubCount + manualCount;
  const allEligibleSelected =
    eligibleSignups.length > 0 && selectedEligibleIds.length === eligibleSignups.length;

  const selectedClubEmails = useMemo(() => {
    const byId = new Map(signups.map((signup) => [signup.id, signup]));
    return selectedEligibleIds
      .map((id) => normalizeEmail(byId.get(id)?.email ?? ""))
      .filter(Boolean);
  }, [signups, selectedEligibleIds]);

  const close = () => {
    setDraft(null);
    setError(null);
  };

  const toggleOne = (id: string, eligible: boolean) => {
    if (!eligible) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allEligibleSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(eligibleSignups.map((signup) => signup.id)));
  };

  const addManualEmail = () => {
    setManualError(null);
    const email = normalizeEmail(manualInput);
    if (!email || !isValidEmailFormat(email)) {
      setManualError("נא להזין אימייל תקין.");
      return;
    }
    if (manualEmails.includes(email) || selectedClubEmails.includes(email)) {
      setManualError("האימייל כבר ברשימת הנמענים.");
      return;
    }
    setManualEmails((prev) => [...prev, email]);
    setManualInput("");
  };

  const openPreview = () => {
    setSendError(null);
    if (!subject.trim()) {
      setSendError("נא למלא נושא.");
      return;
    }
    if (!body.trim()) {
      setSendError("נא למלא גוף הודעה.");
      return;
    }
    if (totalRecipients === 0) {
      setSendError("נא לבחור לפחות נמען אחד תקין.");
      return;
    }
    clientRequestIdRef.current = createId("sendreq");
    setPreviewOpen(true);
  };

  const confirmAndSend = () => {
    const count = totalRecipients;
    const ok = window.confirm(`אתה עומד לשלוח את ההודעה ל-${count} נמענים. להמשיך?`);
    if (!ok) return;

    setSendError(null);
    startSendTransition(async () => {
      try {
        const result = await sendCustomerClubCampaignAction({
          signupIds: selectedEligibleIds,
          manualEmails,
          subject,
          body,
          clientRequestId: clientRequestIdRef.current || createId("sendreq")
        });

        if (!result.ok) {
          setSendError(result.error);
          return;
        }

        setPreviewOpen(false);
        setSendSummary(result.campaign);
        setSelectedIds(new Set());
        setManualEmails([]);
        setSubject("");
        setBody("");
        setTab("history");
        router.refresh();
      } catch (error) {
        setSendError(error instanceof Error ? error.message : "שליחת הדיוור נכשלה. נסו שוב.");
      }
    });
  };

  return (
    <>
      <div className="admin-story-view-toggle" role="tablist" aria-label="מועדון לקוחות">
        <button
          type="button"
          className={`button secondary${tab === "members" ? " is-active" : ""}`}
          role="tab"
          aria-selected={tab === "members"}
          onClick={() => setTab("members")}
        >
          חברים ודיוור
        </button>
        <button
          type="button"
          className={`button secondary${tab === "history" ? " is-active" : ""}`}
          role="tab"
          aria-selected={tab === "history"}
          onClick={() => setTab("history")}
        >
          היסטוריית דיוור
        </button>
      </div>

      {tab === "members" ? (
        <>
          <AdminToolbar label="הוסף הרשמה ידנית" onAdd={() => setDraft(newSignup())} />

          <p className="admin-form-hint" role="status">
            נבחרו {totalRecipients} נמענים
            <span className="admin-club-recipient-breakdown">
              {" "}
              ({selectedClubCount} מהמועדון · {manualCount} ידניים)
            </span>
          </p>

          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>
                  <label className="admin-club-select-all">
                    <input
                      type="checkbox"
                      checked={allEligibleSelected}
                      onChange={toggleSelectAll}
                      disabled={eligibleSignups.length === 0 || isSending}
                      aria-label="בחר הכל"
                    />
                    <span>בחר הכל</span>
                  </label>
                </th>
                <th>שם</th>
                <th>פרטי קשר</th>
                <th>תאריך לידה</th>
                <th>נשלח ב־</th>
                <th>אישור</th>
                <th>זמין לדיוור</th>
                <th>סטטוס</th>
                <th style={{ width: 160 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((signup) => {
                const eligible = isMailEligible(signup);
                const reason = eligibilityReason(signup);
                return (
                  <tr key={signup.id} className={eligible ? undefined : "admin-club-row--disabled"}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(signup.id)}
                        disabled={!eligible || isSending}
                        onChange={() => toggleOne(signup.id, eligible)}
                        aria-label={`בחירת ${signup.fullName}`}
                      />
                    </td>
                    <td>{signup.fullName}</td>
                    <td>
                      {signup.phone}
                      <br />
                      {signup.email || "—"}
                    </td>
                    <td>{signup.birthDate || "—"}</td>
                    <td>{formatSubmittedAt(signup.createdAt)}</td>
                    <td>{signup.marketingConsent ? "כן" : "לא"}</td>
                    <td>{eligible ? "כן" : reason}</td>
                    <td>{signup.status}</td>
                    <td>
                      <AdminRowActions
                        disabled={isPending || isSending}
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
                );
              })}
            </tbody>
          </table>

          <fieldset className="admin-fieldset" style={{ marginTop: 20 }}>
            <legend>הוסף נמען ידני</legend>
            <div className="admin-row-actions" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
              <label style={{ flex: "1 1 220px" }}>
                אימייל
                <input
                  type="email"
                  value={manualInput}
                  disabled={isSending}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addManualEmail();
                    }
                  }}
                  placeholder="name@example.com"
                />
              </label>
              <button type="button" className="button secondary" disabled={isSending} onClick={addManualEmail}>
                הוסף
              </button>
            </div>
            {manualError ? (
              <p className="admin-form-error" role="alert">
                {manualError}
              </p>
            ) : null}
            {manualEmails.length > 0 ? (
              <ul className="admin-club-manual-list">
                {manualEmails.map((email) => (
                  <li key={email}>
                    <span>{email}</span>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={isSending}
                      onClick={() => setManualEmails((prev) => prev.filter((item) => item !== email))}
                    >
                      הסר
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </fieldset>

          <fieldset className="admin-fieldset" style={{ marginTop: 16 }}>
            <legend>כתיבת הודעה</legend>
            <label>
              נושא
              <input
                value={subject}
                disabled={isSending}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="נושא המייל"
              />
            </label>
            <label>
              גוף ההודעה
              <textarea
                rows={8}
                value={body}
                disabled={isSending}
                onChange={(e) => setBody(e.target.value)}
                placeholder="כתבו כאן את תוכן ההודעה..."
              />
            </label>
            {sendError ? (
              <p className="admin-form-error" role="alert">
                {sendError}
              </p>
            ) : null}
            <div className="admin-form-actions">
              <button type="button" className="button" disabled={isSending} onClick={openPreview}>
                תצוגה מקדימה
              </button>
            </div>
          </fieldset>

          {sendSummary ? (
            <div className="admin-fieldset" style={{ marginTop: 16 }} role="status">
              <p>
                <strong>סיכום שליחה אחרונה</strong>
              </p>
              <p>
                נשלחו בהצלחה: {sendSummary.sentCount} · נכשלו: {sendSummary.failedCount} · דולגו:{" "}
                {sendSummary.skippedCount}
              </p>
              <button type="button" className="button secondary" onClick={() => setDetailCampaign(sendSummary)}>
                פירוט
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>תאריך</th>
              <th>נושא</th>
              <th>נמענים</th>
              <th>נשלחו</th>
              <th>נכשלו</th>
              <th>דולגו</th>
              <th>סטטוס</th>
              <th style={{ width: 120 }}>פרטים</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={8}>אין היסטוריית דיוור עדיין.</td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>{formatSubmittedAt(campaign.sentAt || campaign.createdAt)}</td>
                  <td>{campaign.subject}</td>
                  <td>{campaign.selectedCount}</td>
                  <td>{campaign.sentCount}</td>
                  <td>{campaign.failedCount}</td>
                  <td>{campaign.skippedCount}</td>
                  <td>{statusLabel(campaign.status)}</td>
                  <td>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setDetailCampaign(campaign)}
                    >
                      פתח
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

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
              אימייל (לא חובה)
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
              נשלח ב־
              <input readOnly value={formatSubmittedAt(draft.createdAt)} />
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

      <AdminModal
        open={previewOpen}
        stacked
        title="תצוגה מקדימה לפני שליחה"
        onClose={() => {
          if (isSending) return;
          setPreviewOpen(false);
        }}
      >
        <div className="admin-form">
          <p>
            <strong>From:</strong> NB BURGER &lt;club@nbburger.co.il&gt;
          </p>
          <p>
            <strong>Subject:</strong> {subject}
          </p>
          <p>
            <strong>נמענים:</strong> {totalRecipients} (מועדון: {selectedClubCount} · ידניים:{" "}
            {manualCount})
          </p>
          <div className="admin-club-preview-body">
            <strong>גוף ההודעה:</strong>
            <pre>{body}</pre>
          </div>
          <div className="admin-club-preview-recipients">
            <strong>רשימת נמענים:</strong>
            <ul>
              {selectedClubEmails.map((email) => (
                <li key={`club-${email}`}>{email} (מועדון)</li>
              ))}
              {manualEmails.map((email) => (
                <li key={`manual-${email}`}>{email} (ידני)</li>
              ))}
            </ul>
          </div>
          {sendError ? (
            <p className="admin-form-error" role="alert">
              {sendError}
            </p>
          ) : null}
          <div className="admin-form-actions">
            <button
              type="button"
              className="button secondary"
              disabled={isSending}
              onClick={() => setPreviewOpen(false)}
            >
              חזרה לעריכה
            </button>
            <button type="button" className="button" disabled={isSending} onClick={confirmAndSend}>
              {isSending ? "שולח…" : "שלח עכשיו"}
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(detailCampaign)}
        stacked
        title={detailCampaign ? `קמפיין: ${detailCampaign.subject}` : "קמפיין"}
        onClose={() => setDetailCampaign(null)}
      >
        {detailCampaign ? (
          <div className="admin-form">
            <p>
              נשלח ב־{formatSubmittedAt(detailCampaign.sentAt || detailCampaign.createdAt)} · סטטוס:{" "}
              {statusLabel(detailCampaign.status)}
            </p>
            <p>
              נשלחו: {detailCampaign.sentCount} · נכשלו: {detailCampaign.failedCount} · דולגו:{" "}
              {detailCampaign.skippedCount}
            </p>
            <p>
              From: {detailCampaign.fromName} &lt;{detailCampaign.fromEmail}&gt;
            </p>
            <div className="admin-club-preview-body">
              <pre>{detailCampaign.body}</pre>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>אימייל</th>
                  <th>מקור</th>
                  <th>סטטוס</th>
                  <th>שגיאה</th>
                </tr>
              </thead>
              <tbody>
                {detailCampaign.recipients.map((recipient, index) => (
                  <tr key={`${recipient.email}-${index}`}>
                    <td>{recipient.email}</td>
                    <td>{recipient.source === "club" ? "מועדון" : "ידני"}</td>
                    <td>{recipient.status}</td>
                    <td>{recipient.error || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="admin-form-actions">
              <button type="button" className="button secondary" onClick={() => setDetailCampaign(null)}>
                סגור
              </button>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </>
  );
}
