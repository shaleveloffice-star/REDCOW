const STYLE_ID = "site-chrome-metrics";
const METRIC_VARS = [
  "--site-chrome-offset",
  "--site-mobile-cta-height",
  "--home-atmosphere-sticky-top",
  "--home-atmosphere-sticky-height"
] as const;

function applySiteChromeMetrics(offset: number, ctaHeight: number, stickyTop: number, stickyHeight: number): void {
  const css = `:root{${METRIC_VARS[0]}:${offset}px;${METRIC_VARS[1]}:${ctaHeight}px;${METRIC_VARS[2]}:${stickyTop}px;${METRIC_VARS[3]}:${stickyHeight}px;}`;

  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;

  const root = document.documentElement;
  for (const name of METRIC_VARS) {
    root.style.removeProperty(name);
  }
}

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

  applySiteChromeMetrics(Math.ceil(bannerHeight + navbarHeight), ctaHeight, stickyTop, stickyHeight);
}
