"use client";

import { useEffect } from "react";

/** Keeps chrome tokens in sync so atmosphere fills the exact gap between header and mobile CTAs. */
export function SiteChromeOffsetSync() {
  useEffect(() => {
    const banner = document.querySelector<HTMLElement>(".site-opening-banner");
    const navbar = document.querySelector<HTMLElement>(".site-navbar");
    const mobileCta = document.querySelector<HTMLElement>(".site-cta--mobile");

    const sync = () => {
      const viewportHeight = Math.round(window.innerHeight);
      const bannerHeight = banner?.getBoundingClientRect().height ?? 0;
      const navbarRect = navbar?.getBoundingClientRect();
      const navbarHeight = navbarRect?.height ?? 0;
      const headerBottom = Math.ceil(navbarRect?.bottom ?? bannerHeight + navbarHeight);
      const ctaRect = mobileCta?.getBoundingClientRect();
      const ctaVisible = Boolean(ctaRect && ctaRect.height > 1);
      const ctaHeight = ctaVisible && ctaRect ? Math.ceil(ctaRect.height) : 0;
      const ctaTop = ctaVisible && ctaRect ? Math.round(ctaRect.top) : viewportHeight;
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      const stickyTop = isDesktop ? 0 : Math.max(0, headerBottom);
      const stickyHeight = isDesktop
        ? viewportHeight
        : Math.max(0, ctaTop - stickyTop);

      const root = document.documentElement;
      root.style.setProperty("--site-chrome-offset", `${Math.ceil(bannerHeight + navbarHeight)}px`);
      root.style.setProperty("--site-mobile-cta-height", `${ctaHeight}px`);
      root.style.setProperty("--home-atmosphere-sticky-top", `${stickyTop}px`);
      root.style.setProperty("--home-atmosphere-sticky-height", `${stickyHeight}px`);
    };

    sync();

    const observer = new ResizeObserver(sync);
    if (banner) observer.observe(banner);
    if (navbar) observer.observe(navbar);
    if (mobileCta) observer.observe(mobileCta);

    window.addEventListener("resize", sync, { passive: true });
    window.addEventListener("scroll", sync, { passive: true });
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
    };
  }, []);

  return null;
}
