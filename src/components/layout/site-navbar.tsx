"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "דף הבית", href: "/#hero" },
  { label: "על הפלנצ׳ה", href: "/#plancha" },
  { label: "מה יוצא מהמטבח", href: "/#kitchen" },
  { label: "התפריט", href: "/#menu" },
  { label: "האווירה", href: "/#atmosphere" },
  { label: "מיקום ושעות", href: "/#location" }
];

type SiteNavbarProps = {
  overlay?: boolean;
};

export function SiteNavbar({ overlay = false }: SiteNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

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
        <nav className="site-navbar-inner" aria-label="ניווט ראשי">
          <Link href="/#hero" className="site-navbar-brand">
            <img
              className="site-navbar-logo"
              src="/images/brand/nb-burger-wordmark-alpha.png?v=4"
              alt="NB BURGER"
              width={160}
              height={72}
            />
          </Link>
          <button
            type="button"
            className="site-navbar-toggle"
            aria-label="פתח תפריט"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="site-nav-overlay"
            className="site-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              className="site-nav-overlay-close"
              aria-label="סגור תפריט"
              onClick={() => setIsOpen(false)}
            >
              <X strokeWidth={1.5} aria-hidden="true" />
            </button>
            <div className="site-nav-overlay-links">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className="site-nav-overlay-link"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.35 }}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
