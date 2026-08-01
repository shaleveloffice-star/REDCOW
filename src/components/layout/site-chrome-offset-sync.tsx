"use client";

import { useEffect } from "react";

/** Keeps `--site-chrome-offset` in sync with the fixed banner + navbar height. */
export function SiteChromeOffsetSync() {
  useEffect(() => {
    const banner = document.querySelector<HTMLElement>(".site-opening-banner");
    const navbar = document.querySelector<HTMLElement>(".site-navbar");

    const sync = () => {
      const bannerHeight = banner?.getBoundingClientRect().height ?? 0;
      const navbarHeight = navbar?.getBoundingClientRect().height ?? 0;
      const total = Math.ceil(bannerHeight + navbarHeight);

      document.documentElement.style.setProperty("--site-chrome-offset", `${total}px`);
    };

    sync();

    const observer = new ResizeObserver(sync);
    if (banner) observer.observe(banner);
    if (navbar) observer.observe(navbar);

    window.addEventListener("resize", sync, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return null;
}
