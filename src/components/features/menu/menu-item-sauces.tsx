"use client";

import { useEffect, useRef, useState } from "react";
import { SauceDialog } from "@/components/features/menu/sauce-dialog";
import { startSauceLoop } from "@/lib/menu/sauce-loop";
import { useLocale } from "@/components/providers/locale-provider";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { MenuItem } from "@/types/content";

/** Must match the media query wrapping the `.menu-item-sauces--moving` rules in menu-item-detail.css. */
const NARROW_SCREEN_QUERY = "(max-width: 767px)";

export function MenuItemSauces({ sauces }: { sauces: MenuItem[] }) {
  const { locale } = useLocale();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const moving = sauces.length > 3;
  // Wide screens show every sauce in a static row; only narrow screens loop.
  const [looping, setLooping] = useState(false);
  useEffect(() => {
    if (!moving) return;
    const narrow = window.matchMedia(NARROW_SCREEN_QUERY);
    const sync = () => setLooping(narrow.matches);
    sync();
    narrow.addEventListener("change", sync);
    return () => narrow.removeEventListener("change", sync);
  }, [moving]);
  useEffect(() => {
    if (looping && viewportRef.current) return startSauceLoop(viewportRef.current);
  }, [looping, sauces]);
  if (!sauces.length) return null;
  const labels = locale === "en"
    ? { title: "Sauces", choice: "Choice of 2 sauces included", empty: "No description yet." }
    : locale === "fr"
      ? { title: "Sauces", choice: "2 sauces au choix incluses", empty: "Pas encore de description." }
      : { title: "הרטבים של המנה", choice: "2 רטבים לבחירה בתוך המנה", empty: "טרם נוסף תיאור לרוטב." };
  const selectedText = selected ? getLocalizedMenuItem(selected, locale) : null;
  return (
    <section className={`menu-item-sauces${moving ? " menu-item-sauces--moving" : ""}`} aria-label={labels.title}>
      <p className="menu-item-sauces-choice">{labels.choice}</p>
      <div className="menu-item-sauces-viewport" ref={viewportRef} data-dialog-open={Boolean(selected)} tabIndex={looping ? 0 : undefined} role={looping ? "region" : undefined} aria-label={labels.title}>
      <div className="menu-item-sauces-track">
      <div className="menu-item-sauces-list" dir={locale === "he" ? "rtl" : "ltr"}>
        {sauces.map(sauce => {
          const localized = getLocalizedMenuItem(sauce, locale);
          return (
            <div className="menu-item-sauce" key={sauce.id}>
              <button className="menu-item-sauce-trigger" type="button" aria-haspopup="dialog" onClick={event => { triggerRef.current = event.currentTarget; setSelected(sauce); }}>
                {sauce.imageUrl && !isVideoMediaUrl(sauce.imageUrl) ? (
                  <MenuItemImage src={sauce.imageUrl} alt="" width={48} height={48} sizes="48px" className="menu-item-sauce-image" />
                ) : null}
                <span>{localized.name}</span>
              </button>
            </div>
          );
        })}
      </div>
      </div>
      </div>
      {selected && selectedText ? <SauceDialog name={selectedText.name} description={selectedText.description || selectedText.longDescription || labels.empty} imageUrl={selected.imageUrl} closeLabel={locale === "he" ? "סגירה" : locale === "fr" ? "Fermer" : "Close"} onClose={() => setSelected(null)} trigger={triggerRef.current} dir={locale === "he" ? "rtl" : "ltr"} /> : null}
    </section>
  );
}
