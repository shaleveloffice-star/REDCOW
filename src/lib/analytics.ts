export const GA_MEASUREMENT_ID = "G-2TM782BRGC";

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

/**
 * Official gtag.js stub: queue commands onto dataLayer via the `arguments` object.
 * gtag.js (loaded separately) consumes this queue. Automatic hits do not need this;
 * custom events do.
 */
function ensureGtag(): GtagFunction {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") {
    return window.gtag;
  }

  const gtag: GtagFunction = function gtag() {
    window.dataLayer!.push(arguments);
  };
  window.gtag = gtag;
  return gtag;
}

export function trackPageView(url: string): void {
  if (typeof window === "undefined") {
    return;
  }

  ensureGtag()("config", GA_MEASUREMENT_ID, {
    page_path: url
  });
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") {
    return;
  }

  ensureGtag()("event", eventName, params);
}
