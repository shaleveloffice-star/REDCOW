"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MenuAutoplayMedia } from "@/components/features/menu/menu-autoplay-media";
import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { OrderModal } from "@/components/layout/order-modal";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { IconBurgerMark } from "@/components/shared/site-icons";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { getLocalizedCategoryName } from "@/i18n/category-translations";
import { getLocalizedMenuItem, getMenuItemCloseUpImageUrl } from "@/i18n/menu-translations";
import { resolveMenuItemCloseUpAlt, DECORATIVE_IMAGE_ALT } from "@/lib/image-alt";
import { getMenuCategoryHref } from "@/lib/menu/category-slug";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { resolveMenuItemMediaUrl } from "@/lib/menu/normalize-menu";
import type { MenuCategory, MenuItem } from "@/types/content";

type MenuItemDetailViewProps = {
  item: MenuItem;
  category?: Pick<MenuCategory, "id" | "name" | "slug">;
  pickupUrl: string;
  deliveryUrl: string;
};

const PLACEHOLDER_IMAGE = "/images/menu/nb-menu-burger.png";
const PRODUCT_LONG_ICON = "/images/menu/product-long-drool.gif";

function splitLongDescription(longDescription: string): string[] {
  return longDescription
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function MenuItemDetailView({
  item,
  category,
  pickupUrl,
  deliveryUrl
}: MenuItemDetailViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const localized = getLocalizedMenuItem(item, locale);
  const categoryName = category ? getLocalizedCategoryName(category, locale) : undefined;
  const primaryMedia = resolveMenuItemMediaUrl(item.imageUrl, PLACEHOLDER_IMAGE);
  const closeUpMedia = getMenuItemCloseUpImageUrl(item);
  const closeUpAlt = resolveMenuItemCloseUpAlt(item, locale, localized.name);
  const primaryIsVideo = isVideoMediaUrl(primaryMedia);
  const closeUpIsVideo = closeUpMedia ? isVideoMediaUrl(closeUpMedia) : false;
  const [orderOpen, setOrderOpen] = useState(false);

  const longParagraphs = useMemo(
    () => splitLongDescription(localized.longDescription),
    [localized.longDescription]
  );

  return (
    <article className="menu-item-detail">
      <div
        className={`menu-item-detail-gallery${closeUpMedia ? " menu-item-detail-gallery--dual" : ""}`}
        aria-label={t.menuItemDetail.galleryAria}
      >
        <div className="menu-item-detail-gallery-cell menu-item-detail-gallery-cell--primary">
          {primaryIsVideo ? (
            <MenuAutoplayMedia src={primaryMedia} name={localized.imageAlt} />
          ) : (
            <MenuItemImage
              src={primaryMedia}
              alt={localized.imageAlt}
              width={1200}
              height={1200}
              sizes={closeUpMedia ? "50vw" : "100vw"}
              loading="eager"
              className="menu-item-detail-gallery-image"
            />
          )}
        </div>

        {closeUpMedia ? (
          <div className="menu-item-detail-gallery-cell menu-item-detail-gallery-cell--secondary">
            {closeUpIsVideo ? (
              <MenuAutoplayMedia src={closeUpMedia} name={closeUpAlt} />
            ) : (
              <MenuItemImage
                src={closeUpMedia}
                alt={closeUpAlt}
                width={1200}
                height={1200}
                sizes="50vw"
                loading="eager"
                className="menu-item-detail-gallery-image menu-item-detail-gallery-image--detail"
              />
            )}
          </div>
        ) : null}
      </div>

      <section className="menu-item-detail-intro" aria-labelledby="menu-item-detail-title">
        <MenuBreadcrumbs
          items={[
            { label: t.nav.home, href: "/" },
            { label: t.nav.menu, href: "/menu" },
            ...(category && categoryName
              ? [{ label: categoryName, href: getMenuCategoryHref(category) }]
              : []),
            { label: localized.name }
          ]}
        />
        <IconBurgerMark className="menu-item-detail-mark" />
        <h1 id="menu-item-detail-title" className="menu-item-detail-title">
          {localized.name}
        </h1>
        {localized.description.trim() ? (
          <p className="menu-item-detail-short">{localized.description}</p>
        ) : null}

        <button
          type="button"
          className="menu-item-detail-order"
          onClick={() => setOrderOpen(true)}
        >
          {t.menuItemDetail.orderNow}
        </button>
      </section>

      {longParagraphs.length > 0 ? (
        <section
          className="menu-item-detail-long menu-item-detail-card menu-item-detail-card--dark"
          aria-labelledby="menu-item-detail-long-title"
        >
          <h2 id="menu-item-detail-long-title" className="menu-item-detail-long-title">
            {t.menuItemDetail.longSectionTitle}
          </h2>
          <div className="menu-item-detail-card-head">
            <span className="menu-item-detail-card-rule" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PRODUCT_LONG_ICON}
              alt={DECORATIVE_IMAGE_ALT}
              aria-hidden="true"
              className="menu-item-detail-card-icon menu-item-detail-card-icon-gif"
              width={34}
              height={34}
            />
            <span className="menu-item-detail-card-rule" aria-hidden="true" />
          </div>
          {longParagraphs.map((paragraph) => (
            <p key={paragraph} className="menu-item-detail-card-text">
              {paragraph}
            </p>
          ))}
        </section>
      ) : null}

      <div className="menu-item-detail-footer">
        <Link className="menu-item-detail-back" href="/menu">
          {t.menuItemDetail.backToMenu}
        </Link>
      </div>

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        pickupUrl={pickupUrl}
        deliveryUrl={deliveryUrl}
      />
    </article>
  );
}
