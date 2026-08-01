"use client";

import Link from "next/link";

import { MenuAutoplayMedia } from "@/components/features/menu/menu-autoplay-media";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { useLocale } from "@/components/providers/locale-provider";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { getMenuItemHref } from "@/lib/menu/product-slug";
import { resolveMenuItemMediaUrl } from "@/lib/menu/normalize-menu";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { MenuItem } from "@/types/content";

const PLACEHOLDER_IMAGE = "/images/menu/nb-menu-burger.png";

function formatPrice(price: number, locale: string) {
  if (locale === "he") {
    return `${price} ₪`;
  }
  return `${price}`;
}

type MenuItemsGridProps = {
  items: MenuItem[];
  large?: boolean;
};

export function MenuItemsGrid({ items, large = false }: MenuItemsGridProps) {
  const { locale } = useLocale();

  if (items.length === 0) return null;

  return (
    <ul className={`menu-bleecker-grid${large ? " menu-bleecker-grid--burgers" : ""}`}>
      {items.map((item) => {
        const localized = getLocalizedMenuItem(item, locale);
        const media = resolveMenuItemMediaUrl(item.imageUrl, PLACEHOLDER_IMAGE);
        return (
          <li key={item.id}>
            <Link href={getMenuItemHref(item)} className="menu-bleecker-card-link">
              <article className="menu-bleecker-card">
                <div className="menu-bleecker-card-media">
                  {isVideoMediaUrl(media) ? (
                    <MenuAutoplayMedia decorative src={media} name={localized.name} />
                  ) : (
                    <MenuItemImage
                      decorative
                      src={media}
                      alt={localized.imageAlt}
                      width={480}
                      height={480}
                      sizes={large ? "(max-width: 700px) 50vw, 33vw" : "(max-width: 700px) 50vw, 25vw"}
                      loading="lazy"
                      className="menu-bleecker-card-image"
                    />
                  )}
                </div>
                <h3 className="menu-bleecker-card-name">{localized.name}</h3>
                <p className="menu-bleecker-card-price">{formatPrice(item.price, locale)}</p>
              </article>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function isBurgersCategory(category: { slug: string; id: string }) {
  return category.slug === "burgers" || category.id === "cat-burgers";
}
