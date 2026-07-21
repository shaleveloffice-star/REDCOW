"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { MenuAutoplayMedia } from "@/components/features/menu/menu-autoplay-media";
import { OrderModal } from "@/components/layout/order-modal";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import {
  IconBurgerMark,
  IconCowMark,
  IconMedalMark
} from "@/components/shared/site-icons";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { getLocalizedMenuItem, getMenuItemCloseUpImageUrl } from "@/i18n/menu-translations";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { MenuItem } from "@/types/content";

type MenuItemDetailViewProps = {
  item: MenuItem;
  categoryName?: string;
  pickupUrl: string;
  deliveryUrl: string;
};

const PLACEHOLDER_IMAGE = "/images/menu/nb-menu-burger.png";

function resolveStoryCards(notes: string[], longDescription: string): string[] {
  const trimmedNotes = notes.map((note) => note.trim()).filter(Boolean);
  if (trimmedNotes.length >= 2) {
    return trimmedNotes.slice(0, 2);
  }

  const paragraphs = longDescription
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (trimmedNotes.length === 1) {
    return [trimmedNotes[0], paragraphs[0] ?? ""].filter(Boolean);
  }

  return paragraphs.slice(0, 2);
}

export function MenuItemDetailView({
  item,
  pickupUrl,
  deliveryUrl
}: MenuItemDetailViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const localized = getLocalizedMenuItem(item, locale);
  const primaryMedia = item.imageUrl.trim() || PLACEHOLDER_IMAGE;
  const closeUpMedia = getMenuItemCloseUpImageUrl(item);
  const primaryIsVideo = isVideoMediaUrl(primaryMedia);
  const closeUpIsVideo = closeUpMedia ? isVideoMediaUrl(closeUpMedia) : false;
  const [orderOpen, setOrderOpen] = useState(false);

  const storyCards = useMemo(
    () => resolveStoryCards(localized.detailNotes, localized.longDescription),
    [localized.detailNotes, localized.longDescription]
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
              <MenuAutoplayMedia src={closeUpMedia} name={`${localized.imageAlt} — מקרוב`} />
            ) : (
              <MenuItemImage
                src={closeUpMedia}
                alt={`${localized.imageAlt} — מקרוב`}
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
        <IconBurgerMark className="menu-item-detail-mark" />
        <h1 id="menu-item-detail-title" className="menu-item-detail-title">
          {localized.name}
        </h1>
        {localized.description.trim() ? (
          <p className="menu-item-detail-short">{localized.description}</p>
        ) : null}

        <div className="menu-item-detail-actions">
          <button
            type="button"
            className="menu-item-detail-order"
            onClick={() => setOrderOpen(true)}
          >
            {t.menuItemDetail.orderNow}
          </button>
          <Link className="menu-item-detail-allergy" href="/menu">
            <span className="menu-item-detail-allergy-icon" aria-hidden="true">
              i
            </span>
            {t.menuItemDetail.allergyGuide}
          </Link>
        </div>
      </section>

      {storyCards.length > 0 ? (
        <section
          className="menu-item-detail-cards"
          aria-label={t.menuItemDetail.longSectionAria}
        >
          {storyCards.map((copy, index) => {
            const isDark = index === 0;

            return (
              <article
                key={`${index}-${copy.slice(0, 24)}`}
                className={`menu-item-detail-card${isDark ? " menu-item-detail-card--dark" : " menu-item-detail-card--light"}`}
              >
                <div className="menu-item-detail-card-head">
                  <span className="menu-item-detail-card-rule" aria-hidden="true" />
                  {isDark ? (
                    <IconCowMark className="menu-item-detail-card-icon" />
                  ) : (
                    <IconMedalMark className="menu-item-detail-card-icon" />
                  )}
                  <span className="menu-item-detail-card-rule" aria-hidden="true" />
                </div>
                <p className="menu-item-detail-card-text">{copy}</p>
              </article>
            );
          })}
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
