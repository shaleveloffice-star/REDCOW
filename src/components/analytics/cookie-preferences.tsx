"use client";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { analyticsAllowed, CONSENT_EVENT, CONSENT_KEY } from "@/lib/analytics-consent";
import styles from "./cookie-preferences.module.css";

export function CookiePreferences() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const preferencesId = useId();
  const pathname = usePathname();
  const { locale } = useLocale();
  useEffect(() => { try { setOpen(!localStorage.getItem(CONSENT_KEY)); } catch { setOpen(true); } }, []);
  if (pathname.startsWith("/admin") || pathname === "/unsubscribe") return null;
  const t = locale === "en" ? {
    title: "Cookie preferences", text: "Essential storage supports language and accessibility settings. Google Analytics loads only if you allow analytics. You can change your choice here at any time.", yes: "Accept", no: "Decline", preferences: "Update preferences", privacy: "Privacy policy", essential: "Essential cookies (always active)", analytics: "Google Analytics — usage statistics", save: "Save preferences"
  } : locale === "fr" ? {
    title: "Préférences cookies", text: "Le stockage essentiel conserve la langue et les réglages d’accessibilité. Google Analytics se charge uniquement avec votre accord. Vous pouvez modifier ce choix ici à tout moment.", yes: "Accepter", no: "Refuser", preferences: "Modifier les préférences", privacy: "Confidentialité", essential: "Cookies essentiels (toujours actifs)", analytics: "Google Analytics — statistiques", save: "Enregistrer les préférences"
  } : {
    title: "העדפות עוגיות", text: "אחסון חיוני משמש לשפה ולהתאמות נגישות. Google Analytics ייטען רק באישורכם. אפשר לשנות את הבחירה כאן בכל עת.", yes: "מאשר", no: "מסרב", preferences: "עדכון העדפות", privacy: "מדיניות פרטיות", essential: "עוגיות חיוניות (פעילות תמיד)", analytics: "Google Analytics — מדידת שימוש באתר", save: "שמירת העדפות"
  };
  function choose(value: "granted" | "denied") {
    try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Stay denied when storage is unavailable. */ }
    if (value === "denied") {
      // Delete first-party GA cookies at every applicable parent domain.
      for (const cookie of document.cookie.split(";")) {
        const name = cookie.trim().split("=")[0];
        if (!/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) continue;
        const parts = location.hostname.split(".");
        document.cookie = `${name}=;Max-Age=0;path=/`;
        for (let i = 0; i < parts.length - 1; i++) document.cookie = `${name}=;Max-Age=0;path=/;domain=.${parts.slice(i).join(".")}`;
      }
    }
    window.dispatchEvent(new Event(CONSENT_EVENT));
    setEditing(false);
    setOpen(false);
    // Remove an already-loaded third-party script and its timers after withdrawal.
    if (value === "denied" && window.gtag) location.reload();
  }
  return open ? <section className={styles.panel} aria-label={t.title}>
    <h2>{t.title}</h2><p>{t.text} <a href="/privacy-policy">{t.privacy}</a></p>
    <div>
      <button type="button" onClick={() => choose("granted")}>{t.yes}</button>
      <button type="button" onClick={() => choose("denied")}>{t.no}</button>
      <button type="button" aria-expanded={editing} aria-controls={preferencesId} onClick={() => { if (!editing) setAnalytics(analyticsAllowed()); setEditing(!editing); }}>{t.preferences}</button>
    </div>
    {editing && <fieldset id={preferencesId} className={styles.options}>
      <legend>{t.preferences}</legend>
      <label><input type="checkbox" checked disabled />{t.essential}</label>
      <label><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} />{t.analytics}</label>
      <button type="button" onClick={() => choose(analytics ? "granted" : "denied")}>{t.save}</button>
    </fieldset>}
  </section> : <button className={styles.reopen} onClick={() => { setEditing(false); setOpen(true); }}>{t.title}</button>;
}
