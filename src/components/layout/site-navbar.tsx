"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { IconClose } from "@/components/shared/site-icons";
import { SITE_WORDMARK_SRC, SITE_WORDMARK_WEBP_SRC } from "@/data/brand-assets";
import { BUSINESS } from "@/data/business";
import { useTranslations } from "@/components/providers/locale-provider";
import { focusElement, getFocusableElements, trapFocus } from "@/lib/a11y/focus-trap";

type SiteNavbarProps = {
  overlay?: boolean;
  orderUrl?: string;
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
  orderUrl,
  orderLabel,
  menuLabel,
  className
}: {
  orderUrl: string;
  orderLabel: string;
  menuLabel: string;
  className: string;
}) {
  const orderIsExternal = orderUrl.startsWith("http");

  return (
    <div className={className} dir="ltr">
      <a
        className="site-cta-btn site-cta-btn--solid"
        href={orderUrl}
        {...(orderIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {orderLabel}
      </a>
      <a className="site-cta-btn site-cta-btn--outline" href="/menu">
        {menuLabel}
        <span className="site-cta-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </div>
  );
}

export function SiteNavbar({ overlay = false, orderUrl = "#location" }: SiteNavbarProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const navLinks = useMemo(
    () => [
      { label: t.nav.home, href: "/#hero" },
      { label: t.nav.menu, href: "/#menu" },
      { label: t.nav.location, href: "/#location" },
      { label: t.nav.about, href: "/about" },
      { label: t.nav.branches, href: "/branches" }
    ],
    [t]
  );

  const closeMenu = (restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) {
      focusElement(toggleRef.current);
    }
  };

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

  return (
    <>
      <header className={navClass}>
        <nav className="site-navbar-inner" aria-label={t.nav.main}>
          <Link href="/#hero" className="site-navbar-brand">
            <picture>
              <source srcSet={SITE_WORDMARK_WEBP_SRC} type="image/webp" />
              <img
                className="site-navbar-logo"
                src={SITE_WORDMARK_SRC}
                alt="NB BURGER"
                width={160}
                height={72}
                decoding="async"
                fetchPriority="low"
              />
            </picture>
          </Link>

          <div className="site-navbar-end">
            <ul className="site-navbar-links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="site-navbar-link">
                    {link.label}
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

            <CtaButtons
              className="site-cta site-cta--desktop"
              orderUrl={orderUrl}
              orderLabel={t.hero.orderCta}
              menuLabel={t.hero.menuCta}
            />

            <div className="site-navbar-actions">
              <div className="site-navbar-language">
                <LanguageSwitcher />
              </div>
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
        orderUrl={orderUrl}
        orderLabel={t.hero.orderCta}
        menuLabel={t.hero.menuCta}
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
