"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { OrderModal } from "@/components/layout/order-modal";
import {
  IconArrowBack,
  IconClose,
  IconLocationPinFilled,
  IconShoppingBagFilled
} from "@/components/shared/site-icons";
import {
  SITE_WORDMARK_DARK_SRC,
  SITE_WORDMARK_DARK_WEBP_SRC,
  SITE_WORDMARK_LIGHT_SRC,
  SITE_WORDMARK_LIGHT_WEBP_SRC
} from "@/data/brand-assets";
import { resolveImageAlt } from "@/lib/image-alt";
import { BUSINESS } from "@/data/business";
import { useTranslations, useLocale } from "@/components/providers/locale-provider";
import { focusElement, getFocusableElements, trapFocus } from "@/lib/a11y/focus-trap";
import { trackEvent } from "@/lib/analytics";
import type { OrderLink } from "@/types/content";

type SiteNavbarProps = {
  overlay?: boolean;
  orderUrl?: string;
  orderLinks?: OrderLink[];
};

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="site-navbar-social-icon">
      <path
        fill="currentColor"
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.7A2.9 2.9 0 1 1 14.9 12 2.9 2.9 0 0 1 12 14.9zm5.95-8.85a1.15 1.15 0 1 0 1.15 1.15 1.15 1.15 0 0 0-1.15-1.15z"
      />
    </svg>
  );
}

function CtaButtons({
  onOrderClick,
  orderLabel,
  menuLabel,
  className
}: {
  onOrderClick: () => void;
  orderLabel: string;
  menuLabel: string;
  className: string;
}) {
  return (
    <div className={className} dir="ltr">
      <button type="button" className="site-cta-btn site-cta-btn--solid" onClick={onOrderClick}>
        <span className="site-cta-btn-label">{orderLabel}</span>
      </button>
      <a className="site-cta-btn site-cta-btn--outline" href="/menu">
        <span className="site-cta-btn-label">{menuLabel}</span>
        <span className="site-cta-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </div>
  );
}

function resolveOrderUrls(orderLinks: OrderLink[], fallbackOrderUrl: string) {
  const pickup =
    orderLinks.find((link) => link.type === "pickup" && link.isActive)?.url ??
    "/menu";
  const delivery =
    orderLinks.find((link) => (link.type === "delivery" || link.type === "marketplace") && link.isActive)
      ?.url ??
    fallbackOrderUrl ??
    "#location";

  return { pickupUrl: pickup, deliveryUrl: delivery };
}

export function SiteNavbar({
  overlay = false,
  orderUrl = "#location",
  orderLinks = []
}: SiteNavbarProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();
  const logoAlt = resolveImageAlt({ kind: "logo", locale });
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const wordmarkSrc = isScrolled ? SITE_WORDMARK_DARK_SRC : SITE_WORDMARK_LIGHT_SRC;
  const wordmarkWebp = isScrolled ? SITE_WORDMARK_DARK_WEBP_SRC : SITE_WORDMARK_LIGHT_WEBP_SRC;
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orderLocation, setOrderLocation] = useState("navbar");
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bagButtonRef = useRef<HTMLButtonElement>(null);
  const navStackRef = useRef<string[]>([]);

  const { pickupUrl, deliveryUrl } = useMemo(
    () => resolveOrderUrls(orderLinks, orderUrl),
    [orderLinks, orderUrl]
  );

  const navLinks = useMemo(
    () => [
      { label: t.nav.home, href: "/" },
      { label: t.nav.menu, href: "/menu" },
      { label: t.nav.location, href: "/locations" },
      { label: t.nav.about, href: "/about" }
    ],
    [t]
  );

  const openOrderModal = useCallback((location: string) => {
    trackEvent("order_open", { location });
    setOrderLocation(location);
    setIsOpen(false);
    setIsOrderOpen(true);
  }, []);

  const closeOrderModal = useCallback(() => {
    setIsOrderOpen(false);
    focusElement(bagButtonRef.current);
  }, []);

  const closeMenu = (restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) {
      focusElement(toggleRef.current);
    }
  };

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    const stack = navStackRef.current;
    const top = stack[stack.length - 1];

    if (top === pathname) {
      setShowBack(stack.length > 1);
      return;
    }

    const priorIndex = stack.lastIndexOf(pathname);
    if (priorIndex >= 0 && priorIndex < stack.length - 1) {
      navStackRef.current = stack.slice(0, priorIndex + 1);
    } else if (stack.length === 0) {
      navStackRef.current = [pathname];
    } else {
      navStackRef.current = [...stack, pathname];
    }

    setShowBack(navStackRef.current.length > 1);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    focusElement(closeRef.current ?? getFocusableElements(dialog)[0]);
    const releaseTrap = trapFocus(dialog);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      releaseTrap();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const navClass = [
    "site-navbar",
    overlay ? "site-navbar--overlay" : "",
    isScrolled ? "site-navbar--scrolled" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const languageSwitcher = (
    <div className="site-navbar-language">
      <LanguageSwitcher />
    </div>
  );

  return (
    <>
      <header className={navClass}>
        <nav className="site-navbar-inner" aria-label={t.nav.main}>
          <div className="site-navbar-start">
            <Link href="/" className="site-navbar-brand">
              <picture>
                <source srcSet={wordmarkWebp} type="image/webp" />
                <img
                  className="site-navbar-logo"
                  src={wordmarkSrc}
                  alt={logoAlt}
                  width={160}
                  height={72}
                  decoding="async"
                  fetchPriority="low"
                />
              </picture>
            </Link>
          </div>

          <div className="site-navbar-end">
            <ul className="site-navbar-links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="site-navbar-link">
                    <span className="site-navbar-link-label">{link.label}</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={BUSINESS.social.instagram}
                  className="site-navbar-social"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <IconInstagram />
                </a>
              </li>
            </ul>

            <div className="site-navbar-mobile-utilities">
              <button
                ref={bagButtonRef}
                type="button"
                className="site-navbar-icon-btn site-navbar-icon-order"
                aria-label={t.hero.orderCta}
                onClick={() => openOrderModal("navbar")}
              >
                <IconShoppingBagFilled className="site-navbar-icon" />
              </button>
              {languageSwitcher}
              <Link
                href="/locations"
                className="site-navbar-icon-btn site-navbar-icon-location"
                aria-label={t.locations.findLocal}
              >
                <IconLocationPinFilled className="site-navbar-icon" />
              </Link>
            </div>

            <CtaButtons
              className="site-cta site-cta--desktop"
              onOrderClick={() => openOrderModal("navbar")}
              orderLabel={t.hero.orderCta}
              menuLabel={t.hero.menuCta}
            />

            {showBack ? (
              <button
                type="button"
                className="site-navbar-icon-btn site-navbar-back"
                aria-label={t.nav.goBack}
                onClick={handleBack}
              >
                <IconArrowBack className="site-navbar-icon site-navbar-back-icon" />
              </button>
            ) : null}

            <div className="site-navbar-actions">
              <button
                ref={toggleRef}
                type="button"
                className="site-navbar-toggle"
                aria-label={isOpen ? t.nav.closeMenu : t.nav.openMenu}
                aria-expanded={isOpen}
                aria-controls={menuId}
                onClick={() => {
                  if (isOpen) {
                    closeMenu(true);
                  } else {
                    setIsOpen(true);
                  }
                }}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <CtaButtons
        className="site-cta site-cta--mobile"
        onOrderClick={() => openOrderModal("mobile_cta")}
        orderLabel={t.hero.orderCta}
        menuLabel={t.hero.menuCta}
      />

      <OrderModal
        open={isOrderOpen}
        onClose={closeOrderModal}
        pickupUrl={pickupUrl}
        deliveryUrl={deliveryUrl}
        location={orderLocation}
      />

      {isOpen ? (
        <div
          ref={dialogRef}
          id={menuId}
          className="site-nav-overlay site-nav-overlay--open"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.menuDialog}
        >
          <button
            ref={closeRef}
            type="button"
            className="site-nav-overlay-close"
            aria-label={t.nav.closeMenu}
            onClick={() => closeMenu(true)}
          >
            <IconClose />
          </button>
          <div className="site-nav-overlay-links">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                className="site-nav-overlay-link"
                style={{ animationDelay: `${index * 0.08}s` }}
                onClick={() => closeMenu(true)}
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              className="site-nav-overlay-link"
              style={{ animationDelay: `${navLinks.length * 0.08}s` }}
              onClick={() => openOrderModal("nav_overlay")}
            >
              {t.hero.orderCta}
            </button>
            <a
              href={BUSINESS.social.instagram}
              className="site-nav-overlay-link site-nav-overlay-social"
              target="_blank"
              rel="noreferrer"
              onClick={() => closeMenu(true)}
            >
              Instagram
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
