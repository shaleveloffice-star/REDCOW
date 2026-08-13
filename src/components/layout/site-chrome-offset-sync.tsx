"use client";

import { useEffect } from "react";

/** Keeps chrome height tokens in sync with the fixed banner, navbar, and mobile CTAs. */
export function SiteChromeOffsetSync() {
  useEffect(() => {
    const banner = document.querySelector<HTMLElement>(".site-opening-banner");
    const navbar = document.querySelector<HTMLElement>(".site-navbar");
    const mobileCta = document.querySelector<HTMLElement>(".site-cta--mobile");

    const sync = () => {
      const bannerHeight = banner?.getBoundingClientRect().height ?? 0;
      const navbarHeight = navbar?.getBoundingClientRect().height ?? 0;
      const ctaHeight = mobileCta ? Math.ceil(mobileCta.getBoundingClientRect().height) : 0;
      const total = Math.ceil(bannerHeight + navbarHeight);

      document.documentElement.style.setProperty("--site-chrome-offset", `${total}px`);
      document.documentElement.style.setProperty("--site-mobile-cta-height", `${ctaHeight}px`);
    };

    sync();

    const observer = new ResizeObserver(sync);
    if (banner) observer.observe(banner);
    if (navbar) observer.observe(navbar);
    if (mobileCta) observer.observe(mobileCta);

    window.addEventListener("resize", sync, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return null;
}
