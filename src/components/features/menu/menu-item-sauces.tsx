"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { MenuItem } from "@/types/content";

export function MenuItemSauces({ sauces }: { sauces: MenuItem[] }) {
  const { locale } = useLocale();
  if (!sauces.length) return null;
  const labels = locale === "en"
    ? { title: "Sauces", empty: "No description yet." }
    : locale === "fr"
      ? { title: "Sauces", empty: "Pas encore de description." }
      : { title: "הרטבים של המנה", empty: "טרם נוסף תיאור לרוטב." };
  return (
    <section className="menu-item-sauces" aria-label={labels.title}>
      <div className="menu-item-sauces-list">
        {sauces.map(sauce => {
          const localized = getLocalizedMenuItem(sauce, locale);
          return (
            <details className="menu-item-sauce" key={sauce.id}>
              <summary>
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
    </section>
  );
}
