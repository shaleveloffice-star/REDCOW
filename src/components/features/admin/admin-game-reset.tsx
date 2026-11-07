"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetBurgerLeaderboardAction } from "@/server/actions/burger-game.actions";

export function AdminGameReset() {
  const [checked, setChecked] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function reset() {
    if (!checked || pending) return;
    setPending(true); setMessage("");
    try {
      await resetBurgerLeaderboardAction(true);
      setChecked(false); setConfirming(false);
      setMessage("טבלת המשחק ופרטי הקשר אופסו בהצלחה.");
      router.refresh();
    } catch {
      setMessage("האיפוס לא הושלם. ייתכן שחלק מהרשומות נמחקו. אפשר לנסות שוב.");
    } finally { setPending(false); }
  }
  return <section style={{ border: "1px solid #b45309", padding: 16, marginBlock: 20, borderRadius: 10 }}>
    <h3>איפוס טבלת המשחק</h3>
    <p>האיפוס מוחק את כל התוצאות ופרטי הקשר הקיימים. לא ניתן לבטל אותו. משחקים שהתחילו לפני האיפוס לא יוכלו לשמור תוצאה.</p>
    <label style={{ display: "flex", gap: 8, alignItems: "center", marginBlock: 12 }}><input type="checkbox" checked={checked} disabled={pending} onChange={event => { setChecked(event.target.checked); setConfirming(false); }} />אני מבין/ה ומאשר/ת את מחיקת הטבלה ופרטי הקשר</label>
    {!confirming ? <button type="button" disabled={!checked || pending} onClick={() => setConfirming(true)}>איפוס הטבלה</button> : <div>
      <p role="alert">לאפס עכשיו את כל טבלת המשחק? זהו האישור הסופי.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button type="button" disabled={pending || !checked} onClick={reset}>{pending ? "מאפסים…" : "כן, מחקו ואפסו את הטבלה"}</button>
        <button type="button" disabled={pending} onClick={() => { setConfirming(false); setChecked(false); }}>ביטול</button>
      </div>
    </div>}
    <p role="status">{message}</p>
  </section>;
}
