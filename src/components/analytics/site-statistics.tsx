"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { analyticsAllowed, CONSENT_EVENT } from "@/lib/analytics-consent";
import { publicStatisticsPath, sendSiteMetric } from "@/lib/site-statistics";

export function SiteStatistics() {
  const path = usePathname();
  useEffect(() => {
    if (!publicStatisticsPath(path)) return;
    let viewed = false;
    let since: number | null = null;
    function flush() {
      if (since === null) return;
      const seconds = Math.floor((performance.now() - since) / 1000);
      since = null;
      if (seconds > 0 && analyticsAllowed()) sendSiteMetric(path, "seconds", Math.min(seconds, 86400));
    }
    function sync() {
      if (!analyticsAllowed() || document.hidden) return flush();
      if (!viewed) {
        viewed = true;
        sendSiteMetric(path, "views");
      }
      since ??= performance.now();
    }
    sync();
    document.addEventListener("visibilitychange", sync);
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener("pagehide", flush);
    window.addEventListener("pageshow", sync);
    return () => {
      flush();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("pageshow", sync);
    };
  }, [path]);
  return null;
}
