"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  GA_MEASUREMENT_ID,
  isAdminAnalyticsPath,
  trackPageView
} from "@/lib/analytics";

const gaDebugSnippet =
  process.env.NEXT_PUBLIC_GA_DEBUG === "true" ? ", debug_mode: true" : "";

import { analyticsAllowed, CONSENT_EVENT } from "@/lib/analytics-consent";

export function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const sync = () => setAllowed(analyticsAllowed());
    sync(); window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);
  const pathname = usePathname();

  useEffect(() => {
    if (!allowed || isAdminAnalyticsPath(pathname)) {
      return;
    }
    const url = pathname;
    trackPageView(url);
  }, [pathname, allowed]);

  // Do not load gtag on admin routes (avoids admin traffic in the property).
  if (!allowed || isAdminAnalyticsPath(pathname)) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false, page_location: location.origin + location.pathname${gaDebugSnippet} });
          `
        }}
      />
    </>
  );
}
