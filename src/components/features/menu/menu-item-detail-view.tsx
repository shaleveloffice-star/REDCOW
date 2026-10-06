"use client";

import Link from "next/link";
import { MenuItemSauces } from "@/components/features/menu/menu-item-sauces";
import { useMemo, useRef, useState } from "react";

import { MenuAutoplayMedia } from "@/components/features/menu/menu-autoplay-media";
import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { OrderModal } from "@/components/layout/order-modal";
import { formatPrice, isBurgersCategory, MenuItemsGrid } from "@/components/features/menu/menu-items-grid";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { IconBurgerMark } from "@/components/shared/site-icons";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { getLocalizedCategoryName } from "@/i18n/category-translations";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { DECORATIVE_IMAGE_ALT } from "@/lib/image-alt";
import { getMenuCategoryHref } from "@/lib/menu/category-slug";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { resolveMenuItemMediaUrl } from "@/lib/menu/normalize-menu";
import { trackEvent } from "@/lib/analytics";
import type { MenuCategory, MenuItem } from "@/types/content";
import type { MenuIngredient } from "@/types/menu-ingredients";

type MenuItemDetailViewProps = {
  item: MenuItem;
  category?: Pick<MenuCategory, "id" | "name" | "slug">;
  relatedItems?: MenuItem[];
  sauces?: MenuItem[];
  ingredients?: MenuIngredient[];
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
  relatedItems = [],
  sauces = [],
  ingredients,
  pickupUrl,
  deliveryUrl
}: MenuItemDetailViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const localized = getLocalizedMenuItem(item, locale);
  const categoryName = category ? getLocalizedCategoryName(category, locale) : undefined;
  const primaryMedia = resolveMenuItemMediaUrl(item.imageUrl, PLACEHOLDER_IMAGE);
  const primaryIsVideo = isVideoMediaUrl(primaryMedia);
  const [orderOpen, setOrderOpen] = useState(false);
  const orderButtonRef = useRef<HTMLButtonElement>(null);

  const longParagraphs = useMemo(
    () => splitLongDescription(localized.longDescription),
    [localized.longDescription]
  );

  return (
    <article className="menu-item-detail">
      <div className="menu-item-detail-gallery" aria-label={t.menuItemDetail.galleryAria}>
        <div className="menu-item-detail-gallery-cell menu-item-detail-gallery-cell--primary">
          {primaryIsVideo ? (
            <MenuAutoplayMedia src={primaryMedia} name={localized.imageAlt} />
          ) : (
            <MenuItemImage zoom={item.imageZoom}
              src={primaryMedia}
              alt={localized.imageAlt}
              width={1200}
              height={1200}
              sizes="100vw"
              loading="eager"
              className="menu-item-detail-gallery-image"
            />
          )}
        </div>
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
        {item.price > 0 ? (
          <p className="menu-item-detail-price">{formatPrice(item.price, locale)}</p>
        ) : null}

        <MenuItemSauces sauces={sauces} ingredients={ingredients} mode={item.sauceMode} choiceCount={item.sauceChoiceCount} />
        <button
          ref={orderButtonRef}
          type="button"
          className="menu-item-detail-order"
          onClick={() => {
            trackEvent("order_open", { source: "menu_item" });
            setOrderOpen(true);
          }}
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

      {relatedItems.length > 0 ? (
        <section
          className="menu-item-detail-related"
          aria-labelledby="menu-item-detail-related-title"
        >
          <div className="menu-item-detail-related-head">
            <h2 id="menu-item-detail-related-title" className="menu-item-detail-related-title">
              {t.menuItemDetail.relatedItemsTitle}
            </h2>
            <p className="menu-item-detail-related-lead">{t.menuItemDetail.relatedItemsLead}</p>
          </div>
          <MenuItemsGrid
            items={relatedItems}
            large={category ? isBurgersCategory(category) : false}
          />
        </section>
      ) : null}

      <div className="menu-item-detail-footer">
        <Link className="menu-item-detail-back" href="/menu">
          {t.menuItemDetail.backToMenu}
        </Link>
        <Link className="menu-item-detail-back" href="/locations">
          {t.menuItemDetail.viewBranchHours}
        </Link>
      </div>

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        pickupUrl={pickupUrl}
        deliveryUrl={deliveryUrl}
        source="menu_item"
        returnFocusRef={orderButtonRef}
      />
    </article>
  );
}
