import type { OrderLink, SiteSettings } from "@/types/content";

const defaultHeroImageUrl = "/images/hero/burger-hero.png";

export function HeroSection({
  settings,
  orderLinks
}: {
  settings: SiteSettings;
  orderLinks: OrderLink[];
}) {
  const heroMediaUrl = settings.heroMediaUrl || defaultHeroImageUrl;
  const heroMediaType = settings.heroMediaUrl ? settings.heroMediaType : "image";
  const hasHeroMedia = heroMediaType !== "none" && heroMediaUrl.length > 0;
  const primaryOrderLink = orderLinks[0];

  return (
    <section className="hero">
      <div className="hero-background" aria-hidden="true" />
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-inner">
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
        </div>
        <div className="hero-content">
          <p className="hero-kicker">Premium Burgers</p>
          <h1>
            ההמבורגר הקלאסי
            <br />
            עשוי כמו שצריך.
          </h1>
          <span className="hero-divider" />
          <p className="hero-description">
            בשר איכותי, לחמנייה נכונה, רטבים מדויקים וחוויית אוכל נקייה שמחזירה את
            ההמבורגר לבסיס הטוב שלו.
          </p>
          <div className="hero-actions">
            {primaryOrderLink ? (
              <a className="hero-button" href={primaryOrderLink.url}>
                הזמן עכשיו
              </a>
            ) : null}
            <a className="hero-button secondary" href="/menu">
              צפה בתפריט
            </a>
          </div>
        </div>
      </div>
      <a className="hero-scroll" href="/menu">
        גלול למטה
        <span>↓</span>
      </a>
    </section>
  );
}
