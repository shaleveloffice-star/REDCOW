import type { OrderLink, SiteSettings } from "@/types/content";

import { HERO_DEFAULT_IMAGE_URL } from "@/data/site-images.registry";

export function HeroSection({
  settings,
  orderLinks
}: {
  settings: SiteSettings;
  orderLinks: OrderLink[];
}) {
  const heroMediaUrl = settings.heroMediaUrl || HERO_DEFAULT_IMAGE_URL;
  const heroMediaType = settings.heroMediaUrl ? settings.heroMediaType : "image";
  const hasHeroMedia = heroMediaType !== "none" && heroMediaUrl.length > 0;
  const primaryOrderLink = orderLinks[0];

  return (
    <section id="hero" className="hero">
      <div className="hero-visual" aria-label={settings.heroMediaAlt}>
        {hasHeroMedia ? (
          heroMediaType === "video" ? (
            <video autoPlay loop muted playsInline src={heroMediaUrl} />
          ) : (
            <img alt={settings.heroMediaAlt} src={heroMediaUrl} />
          )
        ) : (
          <div className="hero-burger-placeholder" aria-hidden="true" />
        )}
        <div className="hero-scrim" aria-hidden="true" />
      </div>

      <div className="hero-inner">
        <div className="hero-content">
          <p className="hero-tagline hero-tagline--1">בשר שנטחן במקום</p>
          <p className="hero-tagline hero-tagline--2">פלאנצ&apos;ה לוהטת</p>
          <h1 className="hero-title">NB BURGER</h1>
          <div className="hero-actions">
            <a className="hero-button hero-button--menu" href="/menu">
              לתפריט
            </a>
            <a
              className="hero-button hero-button--order"
              href={primaryOrderLink?.url ?? "/menu"}
              {...(primaryOrderLink
                ? { rel: "noopener noreferrer", target: "_blank" }
                : {})}
            >
              להזמנה
            </a>
          </div>
        </div>
      </div>

      <a className="hero-scroll" href="#atmosphere" aria-label="גלול למטה">
        <svg
          className="hero-scroll-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
