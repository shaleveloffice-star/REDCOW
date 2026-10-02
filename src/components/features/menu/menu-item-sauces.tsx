"use client";

import { useState, type CSSProperties } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { MenuItem } from "@/types/content";

export function MenuItemSauces({ sauces }: { sauces: MenuItem[] }) {
  const { locale } = useLocale();
  const [paused, setPaused] = useState(false);
  const moving = sauces.length > 3;
  if (!sauces.length) return null;
  const labels = locale === "en"
    ? { title: "Sauces", empty: "No description yet." }
    : locale === "fr"
      ? { title: "Sauces", empty: "Pas encore de description." }
      : { title: "הרטבים של המנה", empty: "טרם נוסף תיאור לרוטב." };
  return (
    <section className={`menu-item-sauces${moving ? " menu-item-sauces--moving" : ""}`} aria-label={labels.title} style={{ "--sauce-duration": `${sauces.length * 6}s` } as CSSProperties}>
      <div className="menu-item-sauces-viewport">
      <div className="menu-item-sauces-track" data-paused={paused}>
      {(moving ? [0, 1] : [0]).map(copy => (
      <div className="menu-item-sauces-list" key={copy} aria-hidden={copy === 1 ? true : undefined} dir={locale === "he" ? "rtl" : "ltr"}>
        {sauces.map(sauce => {
          const localized = getLocalizedMenuItem(sauce, locale);
          return (
            <details className="menu-item-sauce" key={sauce.id}>
              <summary tabIndex={copy === 1 ? -1 : undefined}>
                {sauce.imageUrl && !isVideoMediaUrl(sauce.imageUrl) ? (
                  <MenuItemImage src={sauce.imageUrl} alt="" width={48} height={48} sizes="48px" className="menu-item-sauce-image" />
                ) : null}
                <span>{localized.name}</span>
              </summary>
              <p className="menu-item-sauce-description">{localized.description || localized.longDescription || labels.empty}</p>
            </details>
          );
        })}
      </div>
      ))}
      </div>
      </div>
      {moving ? <button className="menu-item-sauces-pause" type="button" aria-pressed={paused} aria-label={locale === "he" ? "השהיית תנועת הרטבים" : locale === "fr" ? "Pause du défilement" : "Pause sauce scrolling"} onClick={() => setPaused(value => !value)}>{paused ? "▶" : "Ⅱ"}</button> : null}
    </section>
  );
}
