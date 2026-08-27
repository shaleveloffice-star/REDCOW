"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import {
  GA_MEASUREMENT_ID,
  isAdminAnalyticsPath,
  trackPageView
} from "@/lib/analytics";

const gaDebugSnippet =
  process.env.NEXT_PUBLIC_GA_DEBUG === "true" ? ", debug_mode: true" : "";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAdminAnalyticsPath(pathname)) {
      return;
    }
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    trackPageView(url);
  }, [pathname, searchParams]);

  // Do not load gtag on admin routes (avoids admin traffic in the property).
  if (isAdminAnalyticsPath(pathname)) {
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
            gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false${gaDebugSnippet} });
          `
        }}
      />
    </>
  );
}
