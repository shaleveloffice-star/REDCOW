export const GA_MEASUREMENT_ID = "G-2TM782BRGC";

export type AnalyticsSource =
  | "desktop_navbar"
  | "mobile_navbar"
  | "mobile_sticky_cta"
  | "mobile_nav_overlay"
  | "menu"
  | "menu_item"
  | "home"
  | "home_location"
  | "home_menu_showcase"
  | "home_social"
  | "footer";

export type TrackEventParams = {
  source: AnalyticsSource;
  page?: string;
  /** @deprecated Prefer `source`. Mirrored for GA4 report compatibility. */
  location?: string;
  [key: string]: unknown;
};

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

const isGaDebugEnabled = process.env.NEXT_PUBLIC_GA_DEBUG === "true";

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

function debugParams(): { debug_mode?: true } {
  return isGaDebugEnabled ? { debug_mode: true } : {};
}

/** Current path (+ search) for explicit `page` on business events. */
export function getAnalyticsPage(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return `${window.location.pathname}${window.location.search}`;
}

export function isAdminAnalyticsPath(path: string): boolean {
  return path === "/admin" || path.startsWith("/admin/");
}

export function trackPageView(url: string): void {
  if (typeof window === "undefined") {
    return;
  }
  if (isAdminAnalyticsPath(url.split("?")[0] ?? url)) {
    return;
  }

  // Bootstrap config uses send_page_view: false. Fire SPA page_view explicitly once
  // per route change — do not call gtag('config') again for the same hit.
  ensureGtag()("event", "page_view", {
    page_path: url,
    page_location: window.location.href,
    ...debugParams()
  });
}

/**
 * Central business-event helper. Always attaches `source`, `page`, and mirrors
 * `location` (= source) for existing GA4 reports.
 */
export function trackEvent(eventName: string, params: TrackEventParams): void {
  if (typeof window === "undefined") {
    return;
  }

  const page = params.page ?? getAnalyticsPage();
  if (isAdminAnalyticsPath(page.split("?")[0] ?? page)) {
    return;
  }

  const { source, page: _page, location: _location, ...rest } = params;

  ensureGtag()("event", eventName, {
    ...rest,
    source,
    location: source,
    page,
    ...debugParams()
  });
}
