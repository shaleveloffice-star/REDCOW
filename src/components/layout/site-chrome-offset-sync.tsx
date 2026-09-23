"use client";

import { useLayoutEffect } from "react";

import { scheduleSyncSiteChromeMetrics, syncSiteChromeMetrics } from "@/lib/site-chrome-metrics";

/** Keeps chrome tokens in sync after hydration and on resize (not on every scroll frame). */
export function SiteChromeOffsetSync() {
  useLayoutEffect(() => {
    syncSiteChromeMetrics();

    const banner = document.querySelector<HTMLElement>(".site-opening-banner");
    const navbar = document.querySelector<HTMLElement>(".site-navbar");
    const mobileCta = document.querySelector<HTMLElement>(".site-cta--mobile");
    const observer = new ResizeObserver(() => scheduleSyncSiteChromeMetrics());

    if (banner) observer.observe(banner);
    if (navbar) observer.observe(navbar);
    if (mobileCta) observer.observe(mobileCta);

    window.addEventListener("resize", scheduleSyncSiteChromeMetrics, { passive: true });
    window.visualViewport?.addEventListener("resize", scheduleSyncSiteChromeMetrics);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleSyncSiteChromeMetrics);
      window.visualViewport?.removeEventListener("resize", scheduleSyncSiteChromeMetrics);
    };
  }, []);

  return null;
}
