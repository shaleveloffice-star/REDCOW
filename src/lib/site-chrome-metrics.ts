export function syncSiteChromeMetrics(): void {
  if (typeof window === "undefined") {
    return;
  }

  const banner = document.querySelector<HTMLElement>(".site-opening-banner");
  const navbar = document.querySelector<HTMLElement>(".site-navbar");
  const mobileCta = document.querySelector<HTMLElement>(".site-cta--mobile");
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
  const stickyHeight = isDesktop ? viewportHeight : Math.max(0, ctaTop - stickyTop);
  const root = document.documentElement;

  root.style.setProperty("--site-chrome-offset", `${Math.ceil(bannerHeight + navbarHeight)}px`);
  root.style.setProperty("--site-mobile-cta-height", `${ctaHeight}px`);
  root.style.setProperty("--home-atmosphere-sticky-top", `${stickyTop}px`);
  root.style.setProperty("--home-atmosphere-sticky-height", `${stickyHeight}px`);
}

/** Runs as soon as the header HTML is parsed, before the rest of the page paints. */
export const SITE_CHROME_METRICS_INLINE_SCRIPT = `(function(){
  var banner = document.querySelector(".site-opening-banner");
  var navbar = document.querySelector(".site-navbar");
  var mobileCta = document.querySelector(".site-cta--mobile");
  var viewportHeight = Math.round(window.innerHeight);
  var bannerHeight = banner ? banner.getBoundingClientRect().height : 0;
  var navbarRect = navbar ? navbar.getBoundingClientRect() : null;
  var navbarHeight = navbarRect ? navbarRect.height : 0;
  var headerBottom = Math.ceil(navbarRect ? navbarRect.bottom : bannerHeight + navbarHeight);
  var ctaRect = mobileCta ? mobileCta.getBoundingClientRect() : null;
  var ctaVisible = Boolean(ctaRect && ctaRect.height > 1);
  var ctaHeight = ctaVisible && ctaRect ? Math.ceil(ctaRect.height) : 0;
  var ctaTop = ctaVisible && ctaRect ? Math.round(ctaRect.top) : viewportHeight;
  var isDesktop = window.matchMedia("(min-width: 768px)").matches;
  var stickyTop = isDesktop ? 0 : Math.max(0, headerBottom);
  var stickyHeight = isDesktop ? viewportHeight : Math.max(0, ctaTop - stickyTop);
  var root = document.documentElement;
  root.style.setProperty("--site-chrome-offset", Math.ceil(bannerHeight + navbarHeight) + "px");
  root.style.setProperty("--site-mobile-cta-height", ctaHeight + "px");
  root.style.setProperty("--home-atmosphere-sticky-top", stickyTop + "px");
  root.style.setProperty("--home-atmosphere-sticky-height", stickyHeight + "px");
})();`;
