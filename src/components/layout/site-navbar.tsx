"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

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
import { focusElement, getFocusableElements, inertBackground, isFocusRestoreTarget, trapFocus } from "@/lib/a11y/focus-trap";
import { trackEvent } from "@/lib/analytics";
import type { OrderLink } from "@/types/content";

export type MagazineNavStory = {
  title: string;
  slug: string;
};

type SiteNavbarProps = {
  overlay?: boolean;
  orderUrl?: string;
  orderLinks?: OrderLink[];
  magazineStories?: MagazineNavStory[];
};

/** Touch / stylus / no-hover pointers — prefer tap-to-toggle over hover menus. */
function prefersTouchMenuInteraction(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

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

function IconMagazineChevron({ open = false }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={`site-navbar-magazine-chevron${open ? " is-open" : ""}`}
    >
      <path
        d="M2.5 4.25 6 7.75l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
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
  onOrderClick: (opener: HTMLElement) => void;
  orderLabel: string;
  menuLabel: string;
  className: string;
}) {
  return (
    <div className={className} dir="ltr">
      <button
        type="button"
        className="site-cta-btn site-cta-btn--solid"
        onClick={(event) => onOrderClick(event.currentTarget)}
      >
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
    "/locations";

  return { pickupUrl: pickup, deliveryUrl: delivery };
}

export function SiteNavbar({
  overlay = false,
  orderUrl = "/locations",
  orderLinks = [],
  magazineStories = []
}: SiteNavbarProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();
  const logoAlt = resolveImageAlt({ kind: "logo", locale });
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [desktopMagazineOpen, setDesktopMagazineOpen] = useState(false);
  const [mobileMagazineOpen, setMobileMagazineOpen] = useState(false);
  const wordmarkSrc = isScrolled ? SITE_WORDMARK_DARK_SRC : SITE_WORDMARK_LIGHT_SRC;
  const wordmarkWebp = isScrolled ? SITE_WORDMARK_DARK_WEBP_SRC : SITE_WORDMARK_LIGHT_WEBP_SRC;
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orderLocation, setOrderLocation] = useState("navbar");
  const menuId = useId();
  const magazineMenuId = useId();
  const mobileMagazineId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bagButtonRef = useRef<HTMLButtonElement>(null);
  const magazineRef = useRef<HTMLLIElement>(null);
  const orderReturnFocusRef = useRef<HTMLElement | null>(null);
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

  const magazineItems = useMemo(
    () =>
      magazineStories
        .filter((story) => story.title.trim() && story.slug.trim())
        .map((story) => ({
          title: story.title.trim(),
          href: `/stories/${story.slug.trim()}`
        })),
    [magazineStories]
  );

  const openOrderModal = useCallback((location: string, opener?: HTMLElement | null) => {
    trackEvent("order_open", { location });
    orderReturnFocusRef.current = opener ?? null;
    setOrderLocation(location);
    setIsOpen(false);
    setIsOrderOpen(true);
  }, []);

  const closeOrderModal = useCallback(() => {
    setIsOrderOpen(false);
  }, []);

  const closeMenu = (restoreFocus = true) => {
    setIsOpen(false);
    setMobileMagazineOpen(false);
    if (restoreFocus && isFocusRestoreTarget(toggleRef.current)) {
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
    setDesktopMagazineOpen(false);
    setMobileMagazineOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!desktopMagazineOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!magazineRef.current?.contains(event.target as Node)) {
        setDesktopMagazineOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopMagazineOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [desktopMagazineOpen]);

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

  useLayoutEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const restoreInert = inertBackground(dialog);
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
      restoreInert();
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
              <li
                ref={magazineRef}
                className={`site-navbar-magazine${desktopMagazineOpen ? " is-open" : ""}`}
                onMouseEnter={() => {
                  if (!prefersTouchMenuInteraction()) {
                    setDesktopMagazineOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  if (!prefersTouchMenuInteraction()) {
                    setDesktopMagazineOpen(false);
                  }
                }}
              >
                <a
                  href="/stories"
                  className="site-navbar-link site-navbar-magazine-trigger"
                  aria-haspopup={magazineItems.length > 0 ? "menu" : undefined}
                  aria-expanded={magazineItems.length > 0 ? desktopMagazineOpen : undefined}
                  aria-controls={magazineItems.length > 0 ? magazineMenuId : undefined}
                  onClick={(event) => {
                    if (magazineItems.length === 0) return;
                    // Keyboard (detail === 0): toggle without navigating.
                    if (event.detail === 0) {
                      event.preventDefault();
                      setDesktopMagazineOpen((open) => !open);
                      return;
                    }
                    // Touch / coarse pointer: first tap opens/closes; don't navigate yet.
                    if (prefersTouchMenuInteraction()) {
                      event.preventDefault();
                      setDesktopMagazineOpen((open) => !open);
                    }
                    // Fine pointer mouse click: keep default navigation to /stories.
                  }}
                  onKeyDown={(event) => {
                    if (magazineItems.length === 0) return;
                    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setDesktopMagazineOpen(true);
                    }
                  }}
                >
                  <span className="site-navbar-link-label">
                    {t.nav.magazine}
                    {magazineItems.length > 0 ? <IconMagazineChevron open={desktopMagazineOpen} /> : null}
                  </span>
                </a>
                {magazineItems.length > 0 ? (
                  <ul
                    id={magazineMenuId}
                    className="site-navbar-magazine-menu"
                    role="menu"
                    aria-label={t.nav.magazine}
                    hidden={!desktopMagazineOpen}
                  >
                    {magazineItems.map((item) => (
                      <li key={item.href} role="none">
                        <a
                          href={item.href}
                          className="site-navbar-magazine-item"
                          role="menuitem"
                          onClick={() => setDesktopMagazineOpen(false)}
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
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
                onClick={(event) => openOrderModal("navbar", event.currentTarget)}
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
              onOrderClick={(opener) => openOrderModal("navbar", opener)}
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
        onOrderClick={(opener) => openOrderModal("mobile_cta", opener)}
        orderLabel={t.hero.orderCta}
        menuLabel={t.hero.menuCta}
      />

      <OrderModal
        open={isOrderOpen}
        onClose={closeOrderModal}
        pickupUrl={pickupUrl}
        deliveryUrl={deliveryUrl}
        location={orderLocation}
        returnFocusRef={orderReturnFocusRef}
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
            <div
              className="site-nav-overlay-magazine"
              style={{ animationDelay: `${navLinks.length * 0.08}s` }}
            >
              <div className="site-nav-overlay-magazine-row">
                <a
                  href="/stories"
                  className="site-nav-overlay-link site-nav-overlay-magazine-link"
                  onClick={() => closeMenu(true)}
                >
                  {t.nav.magazine}
                </a>
                {magazineItems.length > 0 ? (
                  <button
                    type="button"
                    className="site-nav-overlay-magazine-toggle"
                    aria-expanded={mobileMagazineOpen}
                    aria-controls={mobileMagazineId}
                    aria-label={t.nav.magazine}
                    onClick={() => setMobileMagazineOpen((open) => !open)}
                  >
                    <IconMagazineChevron open={mobileMagazineOpen} />
                  </button>
                ) : null}
              </div>
              {magazineItems.length > 0 && mobileMagazineOpen ? (
                <ul id={mobileMagazineId} className="site-nav-overlay-magazine-list">
                  {magazineItems.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="site-nav-overlay-magazine-item"
                        onClick={() => closeMenu(true)}
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <button
              type="button"
              className="site-nav-overlay-link"
              style={{ animationDelay: `${(navLinks.length + 1) * 0.08}s` }}
              onClick={() => openOrderModal("nav_overlay", toggleRef.current)}
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
