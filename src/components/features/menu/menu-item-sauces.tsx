"use client";

import { useEffect, useRef, useState } from "react";
import { SauceDialog } from "@/components/features/menu/sauce-dialog";
import { startSauceLoop } from "@/lib/menu/sauce-loop";
import { useLocale } from "@/components/providers/locale-provider";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { ingredientsOnlyHeadingText, sauceHeadingText } from "@/lib/menu/item-sauces";
import { getLocalizedIngredient } from "@/lib/menu/menu-ingredients";
import type { MenuItem, MenuItemSauceMode } from "@/types/content";
import type { MenuIngredient } from "@/types/menu-ingredients";

/** Must match the media query wrapping the `.menu-item-sauces--moving` rules in menu-item-detail.css. */
const NARROW_SCREEN_QUERY = "(max-width: 767px)";

type Entry = { key: string; name: string; description: string; imageUrl: string; imageZoom?: number };

const NO_INGREDIENTS: MenuIngredient[] = [];

export function MenuItemSauces({ sauces, ingredients = NO_INGREDIENTS, mode, choiceCount }: {
  sauces: MenuItem[];
  ingredients?: MenuIngredient[];
  mode?: MenuItemSauceMode;
  choiceCount?: number;
}) {
  const { locale } = useLocale();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Entry | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const entries: Entry[] = [
    ...sauces.map(sauce => {
      const localized = getLocalizedMenuItem(sauce, locale);
      return { key: `sauce-${sauce.id}`, name: localized.name, description: localized.description || localized.longDescription, imageUrl: sauce.imageUrl, imageZoom: sauce.imageZoom };
    }),
    ...ingredients.map(ingredient => ({ key: `ingredient-${ingredient.id}`, ...getLocalizedIngredient(ingredient, locale), imageUrl: ingredient.imageUrl, imageZoom: ingredient.imageZoom }))
  ];
  const moving = entries.length > 3;
  // Wide screens show every entry in a static row; only narrow screens loop.
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
  }, [looping, sauces, ingredients]);
  if (!entries.length) return null;
  const labels = locale === "en"
    ? { title: "Sauces", empty: "No description yet." }
    : locale === "fr"
      ? { title: "Sauces", empty: "Pas encore de description." }
      : { title: "הרטבים של המנה", empty: "טרם נוסף תיאור." };
  const heading = sauces.length ? sauceHeadingText(locale, mode, choiceCount) : ingredientsOnlyHeadingText(locale);
  return (
    <section className={`menu-item-sauces${moving ? " menu-item-sauces--moving" : ""}`} aria-label={labels.title}>
      <p className="menu-item-sauces-choice">{heading}</p>
      <div className="menu-item-sauces-viewport" ref={viewportRef} data-dialog-open={Boolean(selected)} tabIndex={looping ? 0 : undefined} role={looping ? "region" : undefined} aria-label={labels.title}>
      <div className="menu-item-sauces-track">
      {(looping ? [false, true] : [false]).map(isCopy => (
      <div className="menu-item-sauces-list" dir={locale === "he" ? "rtl" : "ltr"} key={isCopy ? "copy" : "list"} aria-hidden={isCopy || undefined}>
        {entries.map(entry => (
          <div className="menu-item-sauce" key={entry.key}>
            <button className="menu-item-sauce-trigger" type="button" aria-haspopup="dialog" tabIndex={isCopy ? -1 : undefined} onClick={event => { triggerRef.current = event.currentTarget; setSelected(entry); }}>
              {entry.imageUrl && !isVideoMediaUrl(entry.imageUrl) ? (
                <MenuItemImage zoom={entry.imageZoom} src={entry.imageUrl} alt="" width={48} height={48} sizes="48px" className="menu-item-sauce-image" />
              ) : null}
              <span>{entry.name}</span>
            </button>
          </div>
        ))}
      </div>
      ))}
      </div>
      </div>
      {selected ? <SauceDialog imageZoom={selected.imageZoom} name={selected.name} description={selected.description || labels.empty} imageUrl={selected.imageUrl} closeLabel={locale === "he" ? "סגירה" : locale === "fr" ? "Fermer" : "Close"} onClose={() => setSelected(null)} trigger={triggerRef.current} dir={locale === "he" ? "rtl" : "ltr"} /> : null}
    </section>
  );
}
