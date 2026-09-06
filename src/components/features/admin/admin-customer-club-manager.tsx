"use client";

import {
  AdminFormFooter,
  AdminModal,
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
import type {
  EmailCampaign,
  EmailCampaignRecipient,
  EmailCampaignRecipientStatus
} from "@/types/email-campaign";
import { History, Mail, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";

const STATUS_OPTIONS: RecordStatus[] = ["new", "inReview", "resolved", "archived"];

type TabKey = "members" | "history";

type MemberMailEvent = {
  campaign: EmailCampaign;
  recipient: EmailCampaignRecipient;
};

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

function recipientStatusLabel(status: EmailCampaignRecipientStatus): string {
  switch (status) {
    case "sent":
      return "נשלח";
    case "failed":
      return "נכשל";
    case "skipped":
      return "דולג";
    case "pending":
      return "ממתין";
    default:
      return status;
  }
}

function recipientStatusClass(status: EmailCampaignRecipientStatus): string {
  switch (status) {
    case "sent":
      return "is-ok";
    case "failed":
      return "is-bad";
    case "skipped":
      return "is-warn";
    default:
      return "is-muted";
  }
}

function campaignStatusClass(status: EmailCampaign["status"]): string {
  switch (status) {
    case "completed":
      return "is-ok";
    case "partial":
      return "is-warn";
    case "failed":
      return "is-bad";
    default:
      return "is-muted";
  }
}

function getMemberMailHistory(
  signup: CustomerClubSignup,
  campaigns: EmailCampaign[]
): MemberMailEvent[] {
  const email = normalizeEmail(signup.email ?? "");
  const events: MemberMailEvent[] = [];

  for (const campaign of campaigns) {
    const recipients = Array.isArray(campaign.recipients) ? campaign.recipients : [];
    const match = recipients.find((recipient) => {
      if (recipient.signupId && recipient.signupId === signup.id) return true;
      if (email && normalizeEmail(recipient.email) === email) return true;
      return false;
    });
    if (match) {
      events.push({ campaign, recipient: match });
    }
  }

  return events.sort(
    (a, b) =>
      Date.parse(b.campaign.sentAt || b.campaign.createdAt) -
      Date.parse(a.campaign.sentAt || a.campaign.createdAt)
  );
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
  const [composeOpen, setComposeOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [detailCampaign, setDetailCampaign] = useState<EmailCampaign | null>(null);
  const [memberHistory, setMemberHistory] = useState<CustomerClubSignup | null>(null);
  const [sendSummary, setSendSummary] = useState<EmailCampaign | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
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

  const filteredSignups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return signups;
    return signups.filter((signup) => {
      const haystack = [signup.fullName, signup.phone, signup.email, signup.status]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [signups, search]);

  const selectedClubEmails = useMemo(() => {
    const byId = new Map(signups.map((signup) => [signup.id, signup]));
    return selectedEligibleIds
      .map((id) => normalizeEmail(byId.get(id)?.email ?? ""))
      .filter(Boolean);
  }, [signups, selectedEligibleIds]);

  const mailHistoryBySignupId = useMemo(() => {
    const map = new Map<string, MemberMailEvent[]>();
    for (const signup of signups) {
      map.set(signup.id, getMemberMailHistory(signup, campaigns));
    }
    return map;
  }, [signups, campaigns]);

  const memberHistoryEvents = useMemo(
    () => (memberHistory ? mailHistoryBySignupId.get(memberHistory.id) ?? [] : []),
    [memberHistory, mailHistoryBySignupId]
  );

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

  const openCompose = () => {
    setSendError(null);
    setManualError(null);
    setComposeOpen(true);
  };

  const closeCompose = () => {
    if (isSending) return;
    setComposeOpen(false);
    setSendError(null);
    setManualError(null);
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
        setComposeOpen(false);
        setSendSummary(result.campaign);
        setSelectedIds(new Set());
        setManualEmails([]);
        setSubject("");
        setBody("");
        setTab("history");
        router.refresh();
      } catch (err) {
        setSendError(err instanceof Error ? err.message : "שליחת הדיוור נכשלה. נסו שוב.");
      }
    });
  };

  return (
    <div className="admin-club">
      <div className="admin-club-topbar">
        <div className="admin-club-tabs" role="tablist" aria-label="מועדון לקוחות">
          <button
            type="button"
            className={`admin-club-tab${tab === "members" ? " is-active" : ""}`}
            role="tab"
            aria-selected={tab === "members"}
            onClick={() => setTab("members")}
          >
            <Users size={16} aria-hidden />
            חברים
            <span className="admin-club-tab-count">{signups.length}</span>
          </button>
          <button
            type="button"
            className={`admin-club-tab${tab === "history" ? " is-active" : ""}`}
            role="tab"
            aria-selected={tab === "history"}
            onClick={() => setTab("history")}
          >
            <History size={16} aria-hidden />
            היסטוריית דיוור
            <span className="admin-club-tab-count">{campaigns.length}</span>
          </button>
        </div>

        {tab === "members" ? (
          <div className="admin-club-actions">
            <button
              type="button"
              className="button secondary"
              disabled={isPending || isSending}
              onClick={() => setDraft(newSignup())}
            >
              <Plus size={16} aria-hidden />
              הוסף חבר
            </button>
            <button type="button" className="button admin-club-broadcast-btn" disabled={isSending} onClick={openCompose}>
              <Mail size={16} aria-hidden />
              הודעת תפוצה
              {totalRecipients > 0 ? <span className="admin-club-broadcast-count">{totalRecipients}</span> : null}
            </button>
          </div>
        ) : null}
      </div>

      {sendSummary ? (
        <div className="admin-club-banner" role="status">
          <div>
            <strong>הדיוור נשלח</strong>
            <p>
              נשלחו בהצלחה: {sendSummary.sentCount} · נכשלו: {sendSummary.failedCount} · דולגו:{" "}
              {sendSummary.skippedCount}
            </p>
          </div>
          <div className="admin-club-banner-actions">
            <button type="button" className="button secondary" onClick={() => setDetailCampaign(sendSummary)}>
              פירוט
            </button>
            <button type="button" className="button secondary" onClick={() => setSendSummary(null)}>
              סגור
            </button>
          </div>
        </div>
      ) : null}

      {tab === "members" ? (
        <>
          <div className="admin-club-stats" aria-label="סיכום מועדון">
            <div className="admin-club-stat">
              <span>סה״כ חברים</span>
              <strong>{signups.length}</strong>
            </div>
            <div className="admin-club-stat">
              <span>זמינים לדיוור</span>
              <strong>{eligibleSignups.length}</strong>
            </div>
            <div className="admin-club-stat">
              <span>נבחרו עכשיו</span>
              <strong>{selectedClubCount}</strong>
            </div>
            <div className="admin-club-stat">
              <span>נמענים ידניים</span>
              <strong>{manualCount}</strong>
            </div>
          </div>

          {selectedClubCount > 0 || manualCount > 0 ? (
            <div className="admin-club-selection-bar" role="status">
              <div>
                <strong>
                  נבחרו {totalRecipients} נמענים
                </strong>
                <span>
                  {selectedClubCount} מהמועדון · {manualCount} ידניים
                </span>
              </div>
              <div className="admin-club-selection-actions">
                <button
                  type="button"
                  className="button secondary"
                  disabled={isSending}
                  onClick={() => {
                    setSelectedIds(new Set());
                    setManualEmails([]);
                  }}
                >
                  נקה בחירה
                </button>
                <button type="button" className="button" disabled={isSending} onClick={openCompose}>
                  המשך להודעת תפוצה
                </button>
              </div>
            </div>
          ) : null}

          <div className="admin-club-table-toolbar">
            <label className="admin-club-search">
              <span className="sr-only">חיפוש חברים</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש לפי שם, טלפון או אימייל…"
              />
            </label>
            <label className="admin-table-toggle">
              <input
                type="checkbox"
                checked={allEligibleSelected}
                onChange={toggleSelectAll}
                disabled={eligibleSignups.length === 0 || isSending}
              />
              <span>בחר הכל הזמינים ({eligibleSignups.length})</span>
            </label>
          </div>

          <div className="admin-club-table-wrap">
            <table className="table admin-club-table">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>בחירה</th>
                  <th>חבר</th>
                  <th>יצירת קשר</th>
                  <th>הצטרפות</th>
                  <th>דיוור</th>
                  <th style={{ width: 148 }}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredSignups.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-club-empty">
                      {signups.length === 0 ? "אין עדיין חברים במועדון." : "לא נמצאו תוצאות לחיפוש."}
                    </td>
                  </tr>
                ) : (
                  filteredSignups.map((signup) => {
                    const eligible = isMailEligible(signup);
                    const reason = eligibilityReason(signup);
                    const memberMails = mailHistoryBySignupId.get(signup.id) ?? [];
                    return (
                      <tr
                        key={signup.id}
                        className={[
                          eligible ? "" : "admin-club-row--disabled",
                          selectedIds.has(signup.id) ? "is-selected" : ""
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(signup.id)}
                            disabled={!eligible || isSending}
                            onChange={() => toggleOne(signup.id, eligible)}
                            aria-label={`בחירת ${signup.fullName}`}
                          />
                        </td>
                        <td>
                          <div className="admin-club-member">
                            <strong>{signup.fullName}</strong>
                            <span className="admin-club-meta">
                              {signup.birthDate ? `יום הולדת ${signup.birthDate}` : "ללא תאריך לידה"} ·{" "}
                              {signup.status}
                              {memberMails.length > 0
                                ? ` · ${memberMails.length} דיוורים`
                                : ""}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="admin-club-contact">
                            <span>{signup.phone || "—"}</span>
                            <span>{signup.email || "אין אימייל"}</span>
                          </div>
                        </td>
                        <td>{formatSubmittedAt(signup.createdAt)}</td>
                        <td>
                          {eligible ? (
                            <span className="admin-club-pill is-ok">זמין</span>
                          ) : (
                            <span className="admin-club-pill is-bad" title={reason}>
                              {reason}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="admin-club-row-actions">
                            <button
                              type="button"
                              className="admin-club-icon-btn"
                              aria-label={`היסטוריית דיוור של ${signup.fullName}`}
                              title="היסטוריית דיוור"
                              onClick={() => setMemberHistory(signup)}
                            >
                              <History size={15} />
                              {memberMails.length > 0 ? (
                                <span className="admin-club-icon-badge">{memberMails.length}</span>
                              ) : null}
                            </button>
                            <button
                              type="button"
                              className="admin-club-icon-btn"
                              disabled={isPending || isSending}
                              aria-label={`עריכת ${signup.fullName}`}
                              onClick={() => setDraft({ ...signup })}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="admin-club-icon-btn is-danger"
                              disabled={isPending || isSending}
                              aria-label={`מחיקת ${signup.fullName}`}
                              onClick={() => {
                                if (!confirmDelete(signup.fullName)) return;
                                run(async () => {
                                  await deleteCustomerClubSignupAction(signup.id);
                                });
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="admin-club-table-wrap">
          <table className="table admin-club-table">
            <thead>
              <tr>
                <th>תאריך</th>
                <th>נושא</th>
                <th>נמענים</th>
                <th>נשלחו</th>
                <th>נכשלו</th>
                <th>דולגו</th>
                <th>סטטוס</th>
                <th style={{ width: 100 }}>פרטים</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-club-empty">
                    אין היסטוריית דיוור עדיין. שלחו הודעת תפוצה ראשונה מהטאב «חברים».
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>{formatSubmittedAt(campaign.sentAt || campaign.createdAt)}</td>
                    <td>
                      <strong>{campaign.subject}</strong>
                    </td>
                    <td>{campaign.selectedCount}</td>
                    <td>{campaign.sentCount}</td>
                    <td>{campaign.failedCount}</td>
                    <td>{campaign.skippedCount}</td>
                    <td>
                      <span className={`admin-club-pill ${campaignStatusClass(campaign.status)}`}>
                        {statusLabel(campaign.status)}
                      </span>
                    </td>
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
        </div>
      )}

      <AdminModal open={Boolean(draft)} title={isNew ? "הוספת חבר" : "עריכת חבר"} onClose={close}>
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
              הצטרף ב־
              <input readOnly value={formatSubmittedAt(draft.createdAt)} />
            </label>
            <label className="admin-checkbox-row">
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
        open={composeOpen}
        size="xl"
        title="הודעת תפוצה"
        onClose={closeCompose}
      >
        <div className="admin-form admin-club-compose">
          <div className="admin-club-compose-summary">
            <div>
              <span>נמענים מהמועדון</span>
              <strong>{selectedClubCount}</strong>
            </div>
            <div>
              <span>נמענים ידניים</span>
              <strong>{manualCount}</strong>
            </div>
            <div>
              <span>סה״כ לשליחה</span>
              <strong>{totalRecipients}</strong>
            </div>
          </div>

          <p className="admin-form-hint">
            בחרו חברים בטבלה לפני או תוך כדי הכתיבה. אפשר גם להוסיף אימיילים ידניים כאן.
          </p>

          <div className="admin-club-compose-manual">
            <label>
              הוסף נמען ידני
              <div className="admin-club-compose-manual-row">
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
                <button type="button" className="button secondary" disabled={isSending} onClick={addManualEmail}>
                  הוסף
                </button>
              </div>
            </label>
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
          </div>

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
              rows={10}
              value={body}
              disabled={isSending}
              onChange={(e) => setBody(e.target.value)}
              placeholder="כתבו כאן את תוכן ההודעה..."
            />
          </label>

          {sendError && !previewOpen ? (
            <p className="admin-form-error" role="alert">
              {sendError}
            </p>
          ) : null}

          <div className="admin-form-actions">
            <button type="button" className="button secondary" disabled={isSending} onClick={closeCompose}>
              ביטול
            </button>
            <button type="button" className="button" disabled={isSending} onClick={openPreview}>
              תצוגה מקדימה
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={previewOpen}
        stacked
        size="wide"
        title="תצוגה מקדימה לפני שליחה"
        onClose={() => {
          if (isSending) return;
          setPreviewOpen(false);
        }}
      >
        <div className="admin-form">
          <div className="admin-club-preview-meta">
            <p>
              <strong>From:</strong> NB BURGER &lt;club@nbburger.co.il&gt;
            </p>
            <p>
              <strong>Subject:</strong> {subject}
            </p>
            <p>
              <strong>נמענים:</strong> {totalRecipients} (מועדון: {selectedClubCount} · ידניים: {manualCount})
            </p>
          </div>
          <div className="admin-club-preview-body">
            <strong>גוף ההודעה</strong>
            <pre>{body}</pre>
          </div>
          <div className="admin-club-preview-recipients">
            <strong>רשימת נמענים</strong>
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
        open={Boolean(memberHistory)}
        size="wide"
        title={memberHistory ? `היסטוריית דיוור · ${memberHistory.fullName}` : "היסטוריית דיוור"}
        onClose={() => setMemberHistory(null)}
      >
        {memberHistory ? (
          <div className="admin-form admin-club-member-history">
            <div className="admin-club-member-history-head">
              <div>
                <strong>{memberHistory.fullName}</strong>
                <p>
                  {memberHistory.email || "אין אימייל"} · {memberHistory.phone || "—"}
                </p>
              </div>
              <span className="admin-club-pill is-muted">{memberHistoryEvents.length} דיוורים</span>
            </div>

            {memberHistoryEvents.length === 0 ? (
              <p className="admin-club-empty">עדיין לא נשלחו דיוורים לחבר זה.</p>
            ) : (
              <div className="admin-club-table-wrap">
                <table className="table admin-club-table">
                  <thead>
                    <tr>
                      <th>תאריך</th>
                      <th>נושא</th>
                      <th>סטטוס לחבר</th>
                      <th>שגיאה</th>
                      <th style={{ width: 100 }}>קמפיין</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberHistoryEvents.map(({ campaign, recipient }) => (
                      <tr key={`${campaign.id}-${recipient.email}`}>
                        <td>
                          {formatSubmittedAt(recipient.sentAt || campaign.sentAt || campaign.createdAt)}
                        </td>
                        <td>
                          <strong>{campaign.subject}</strong>
                        </td>
                        <td>
                          <span className={`admin-club-pill ${recipientStatusClass(recipient.status)}`}>
                            {recipientStatusLabel(recipient.status)}
                          </span>
                        </td>
                        <td>{recipient.error || "—"}</td>
                        <td>
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() => {
                              setMemberHistory(null);
                              setDetailCampaign(campaign);
                            }}
                          >
                            פתח
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="admin-form-actions">
              <button type="button" className="button secondary" onClick={() => setMemberHistory(null)}>
                סגור
              </button>
            </div>
          </div>
        ) : null}
      </AdminModal>

      <AdminModal
        open={Boolean(detailCampaign)}
        stacked
        size="wide"
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
            <div className="admin-club-table-wrap">
              <table className="table admin-club-table">
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
            </div>
            <div className="admin-form-actions">
              <button type="button" className="button secondary" onClick={() => setDetailCampaign(null)}>
                סגור
              </button>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
