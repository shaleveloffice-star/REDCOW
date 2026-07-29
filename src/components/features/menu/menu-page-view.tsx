"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MenuAutoplayMedia } from "@/components/features/menu/menu-autoplay-media";
import { OrderModal } from "@/components/layout/order-modal";
import {
  IconBurgerMark,
  IconDeliveryMark,
  IconLocationPinFilled
} from "@/components/shared/site-icons";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { AutoplayVideo } from "@/components/shared/autoplay-video";
import {
  HERO_DEFAULT_POSTER_URL,
  HERO_DEFAULT_VIDEO_URL
} from "@/data/site-images.registry";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { getMenuItemHref } from "@/lib/menu/product-slug";
import { resolveMenuItemMediaUrl } from "@/lib/menu/normalize-menu";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { MenuCategory, MenuItem } from "@/types/content";

const PLACEHOLDER_IMAGE = "/images/menu/nb-menu-burger.png";

type MenuGroup = MenuCategory & { items: MenuItem[] };

type MenuPageViewProps = {
  groups: MenuGroup[];
  pickupUrl: string;
  deliveryUrl: string;
};

function formatPrice(price: number, locale: string) {
  if (locale === "he") {
    return `${price} ₪`;
  }
  return `${price}`;
}

function isBurgersGroup(group: MenuGroup) {
  return group.slug === "burgers" || group.id === "cat-burgers";
}

function MenuItemsGrid({
  items,
  large,
  locale
}: {
  items: MenuItem[];
  large: boolean;
  locale: "he" | "en" | "fr";
}) {
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
                    <MenuAutoplayMedia src={media} name={localized.name} />
                  ) : (
                    <MenuItemImage
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
                <h2 className="menu-bleecker-card-name">{localized.name}</h2>
                <p className="menu-bleecker-card-price">{formatPrice(item.price, locale)}</p>
              </article>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function MenuPageView({ groups, pickupUrl, deliveryUrl }: MenuPageViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [orderOpen, setOrderOpen] = useState(false);

  const visibleGroups = useMemo(() => {
    if (activeCategoryId === "all") {
      return groups.filter((group) => group.items.length > 0);
    }
    const group = groups.find((entry) => entry.id === activeCategoryId);
    return group && group.items.length > 0 ? [group] : [];
  }, [activeCategoryId, groups]);

  const deliveryExternal = deliveryUrl.startsWith("http");
  const isEmpty = visibleGroups.length === 0;

  return (
    <div className="menu-bleecker">
      <div className="menu-bleecker-hero">
        <AutoplayVideo
          className="menu-bleecker-hero-video"
          src={HERO_DEFAULT_VIDEO_URL}
          poster={HERO_DEFAULT_POSTER_URL}
          aria-label={t.menuPage.heroAlt}
        />
      </div>

      <div className="menu-bleecker-toolbar">
        <h1 className="menu-bleecker-title">{t.menuPage.title}</h1>
      </div>

      <div className="menu-bleecker-filters" role="tablist" aria-label={t.menuPage.title}>
        <button
          type="button"
          role="tab"
          aria-selected={activeCategoryId === "all"}
          className={`menu-bleecker-filter${activeCategoryId === "all" ? " is-active" : ""}`}
          onClick={() => setActiveCategoryId("all")}
        >
          {t.menuPage.filterAll}
        </button>
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            role="tab"
            aria-selected={activeCategoryId === group.id}
            className={`menu-bleecker-filter${activeCategoryId === group.id ? " is-active" : ""}`}
            onClick={() => setActiveCategoryId(group.id)}
          >
            {group.name}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <p className="menu-bleecker-empty">{t.menuPage.empty}</p>
      ) : (
        <div className="menu-bleecker-sections">
          {visibleGroups.map((group) => (
            <MenuItemsGrid
              key={group.id}
              items={group.items}
              large={isBurgersGroup(group)}
              locale={locale}
            />
          ))}
        </div>
      )}

      <section className="menu-bleecker-ctas" aria-label={t.orderModal.title}>
        <button type="button" className="menu-bleecker-cta" onClick={() => setOrderOpen(true)}>
          <IconBurgerMark className="menu-bleecker-cta-icon" />
          <span>{t.orderModal.pickup}</span>
        </button>

        <a
          className="menu-bleecker-cta"
          href={deliveryUrl}
          {...(deliveryExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <IconDeliveryMark className="menu-bleecker-cta-icon" />
          <span>{t.orderModal.delivery}</span>
        </a>

        <Link className="menu-bleecker-cta" href="/locations">
          <IconLocationPinFilled className="menu-bleecker-cta-icon" />
          <span>{t.menuPage.viewLocations}</span>
        </Link>
      </section>

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        pickupUrl={pickupUrl}
        deliveryUrl={deliveryUrl}
      />
    </div>
  );
}
