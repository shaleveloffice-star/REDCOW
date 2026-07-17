"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { IconClose } from "@/components/shared/site-icons";
import { SITE_WORDMARK_SRC, SITE_WORDMARK_WEBP_SRC } from "@/data/brand-assets";
import { useTranslations } from "@/components/providers/locale-provider";

type SiteNavbarProps = {
  overlay?: boolean;
};

export function SiteNavbar({ overlay = false }: SiteNavbarProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
          <button
            type="button"
            className="site-navbar-toggle"
            aria-label={t.nav.openMenu}
            aria-expanded={isOpen}
            onClick={() => setIsOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      {isOpen ? (
        <div className="site-nav-overlay site-nav-overlay--open" role="dialog" aria-modal="true">
          <button
            type="button"
            className="site-nav-overlay-close"
            aria-label={t.nav.closeMenu}
            onClick={() => setIsOpen(false)}
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
                onClick={() => setIsOpen(false)}
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
