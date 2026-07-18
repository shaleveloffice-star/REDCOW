"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { IconClose } from "@/components/shared/site-icons";
import { SITE_WORDMARK_SRC, SITE_WORDMARK_WEBP_SRC } from "@/data/brand-assets";
import { useTranslations } from "@/components/providers/locale-provider";
import { focusElement, getFocusableElements, trapFocus } from "@/lib/a11y/focus-trap";

type SiteNavbarProps = {
  overlay?: boolean;
};

export function SiteNavbar({ overlay = false }: SiteNavbarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const showNavLanguage = pathname !== "/";

  const navLinks = useMemo(
    () => [
      { label: t.nav.home, href: "/#hero" },
      { label: t.nav.menu, href: "/#menu" },
      { label: t.nav.plancha, href: "/#plancha" },
      { label: t.nav.atmosphere, href: "/#atmosphere" },
      { label: t.nav.club, href: "/#club" },
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

  const navClass = overlay ? "site-navbar site-navbar--overlay" : "site-navbar";

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

          <div className="site-navbar-actions">
            {showNavLanguage ? (
              <div className="site-navbar-language">
                <LanguageSwitcher />
              </div>
            ) : null}
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
        </nav>
      </header>

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
          </div>
        </div>
      ) : null}
    </>
  );
}
