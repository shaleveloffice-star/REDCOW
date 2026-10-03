"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { CONSENT_EVENT, CONSENT_KEY } from "@/lib/analytics-consent";
import styles from "./cookie-preferences.module.css";

export function CookiePreferences() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { locale } = useLocale();
  useEffect(() => { try { setOpen(!localStorage.getItem(CONSENT_KEY)); } catch { setOpen(true); } }, []);
  if (pathname.startsWith("/admin") || pathname === "/unsubscribe") return null;
  const t = locale === "en" ? {
    title: "Cookie preferences", text: "Essential storage supports language and accessibility settings. Google Analytics loads only if you allow analytics. You can change your choice here at any time.", yes: "Allow analytics", no: "Essential only", privacy: "Privacy policy"
  } : locale === "fr" ? {
    title: "Préférences cookies", text: "Le stockage essentiel conserve la langue et les réglages d’accessibilité. Google Analytics se charge uniquement avec votre accord. Vous pouvez modifier ce choix ici à tout moment.", yes: "Autoriser les statistiques", no: "Essentiels uniquement", privacy: "Confidentialité"
  } : {
    title: "העדפות עוגיות", text: "אחסון חיוני משמש לשפה ולהתאמות נגישות. Google Analytics ייטען רק באישורכם. אפשר לשנות את הבחירה כאן בכל עת.", yes: "אישור אנליטיקה", no: "חיוניות בלבד", privacy: "מדיניות פרטיות"
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
    setOpen(false);
    // Remove an already-loaded third-party script and its timers after withdrawal.
    if (value === "denied" && window.gtag) location.reload();
  }
  return open ? <section className={styles.panel} aria-label={t.title}>
    <h2>{t.title}</h2><p>{t.text} <a href="/privacy-policy">{t.privacy}</a></p>
    <div><button onClick={() => choose("denied")}>{t.no}</button><button onClick={() => choose("granted")}>{t.yes}</button></div>
  </section> : <button className={styles.reopen} onClick={() => setOpen(true)}>{t.title}</button>;
}
