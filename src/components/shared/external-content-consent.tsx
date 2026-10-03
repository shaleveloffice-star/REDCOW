"use client";
import { useState, type ReactNode } from "react";
import { useLocale } from "@/components/providers/locale-provider";

/** Do not contact an embed provider until the visitor chooses to load its content. */
export function ExternalContentConsent({ provider, className, children }: { provider: string; className?: string; children: ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const { locale } = useLocale();
  if (allowed) return children;
  const label = locale === "he" ? `טעינת תוכן מ־${provider}` : locale === "fr" ? `Charger le contenu ${provider}` : `Load ${provider} content`;
  const notice = locale === "he" ? "הטעינה משתפת מידע טכני עם הספק, שעשוי להשתמש בעוגיות." : locale === "fr" ? "Le chargement partage des informations techniques avec le fournisseur, qui peut utiliser des cookies." : "Loading shares technical information with the provider, which may use cookies.";
  return <div className={className} style={{ display: "grid", alignContent: "center", justifyItems: "center", padding: 20, gap: 12, background: "#f4f4f4", color: "#111" }}>
    <p>{notice}</p><button type="button" className="button" onClick={() => setAllowed(true)}>{label}</button>
  </div>;
}
