"use client";

import Link from "next/link";
import { useState } from "react";

import { MenuAutoplayMedia } from "@/components/features/menu/menu-autoplay-media";
import { OrderModal } from "@/components/layout/order-modal";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { MenuItem } from "@/types/content";

type MenuItemDetailViewProps = {
  item: MenuItem;
  categoryName?: string;
  pickupUrl: string;
  deliveryUrl: string;
};

const PLACEHOLDER_IMAGE = "/images/menu/nb-menu-burger.png";

function formatPrice(price: number, locale: string) {
  if (locale === "he") {
    return `${price} ₪`;
  }
  return `${price}`;
}

export function MenuItemDetailView({
  item,
  categoryName,
  pickupUrl,
  deliveryUrl
}: MenuItemDetailViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const localized = getLocalizedMenuItem(item, locale);
  const media = item.imageUrl.trim() || PLACEHOLDER_IMAGE;
  const isVideo = isVideoMediaUrl(media);
  const [orderOpen, setOrderOpen] = useState(false);
  const longCopy =
    localized.longDescription.trim() ||
    localized.detailNotes.join("\n\n").trim();

  return (
    <article className="menu-item-detail">
      <div className="menu-item-detail-hero">
        <div className="menu-item-detail-media">
          {isVideo ? (
            <MenuAutoplayMedia src={media} name={localized.imageAlt} />
          ) : (
            <MenuItemImage
              src={media}
              alt={localized.imageAlt}
              width={1200}
              height={1200}
              sizes="(max-width: 900px) 92vw, 640px"
              loading="eager"
              className="menu-item-detail-image"
            />
          )}
        </div>

        <div className="menu-item-detail-intro">
          {categoryName ? <p className="menu-item-detail-category">{categoryName}</p> : null}
          <h1 className="menu-item-detail-title">{localized.name}</h1>
          <p className="menu-item-detail-price">{formatPrice(item.price, locale)}</p>
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
        </div>
      </div>

      {longCopy ? (
        <section className="menu-item-detail-long" aria-label={t.menuItemDetail.longSectionAria}>
          {longCopy.split(/\n+/).map((paragraph) => (
            <p key={paragraph} className="menu-item-detail-long-text">
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
