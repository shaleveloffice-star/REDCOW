"use client";

import { useLayoutEffect } from "react";

import { syncSiteChromeMetrics } from "@/lib/site-chrome-metrics";

/** Keeps chrome tokens in sync after hydration and on resize/scroll. */
export function SiteChromeOffsetSync() {
  useLayoutEffect(() => {
    syncSiteChromeMetrics();

    const banner = document.querySelector<HTMLElement>(".site-opening-banner");
    const navbar = document.querySelector<HTMLElement>(".site-navbar");
    const mobileCta = document.querySelector<HTMLElement>(".site-cta--mobile");
    const observer = new ResizeObserver(() => syncSiteChromeMetrics());

    if (banner) observer.observe(banner);
    if (navbar) observer.observe(navbar);
    if (mobileCta) observer.observe(mobileCta);

    window.addEventListener("resize", syncSiteChromeMetrics, { passive: true });
    window.addEventListener("scroll", syncSiteChromeMetrics, { passive: true });
    window.visualViewport?.addEventListener("resize", syncSiteChromeMetrics);
    window.visualViewport?.addEventListener("scroll", syncSiteChromeMetrics);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncSiteChromeMetrics);
      window.removeEventListener("scroll", syncSiteChromeMetrics);
      window.visualViewport?.removeEventListener("resize", syncSiteChromeMetrics);
      window.visualViewport?.removeEventListener("scroll", syncSiteChromeMetrics);
    };
  }, []);

  return null;
}
