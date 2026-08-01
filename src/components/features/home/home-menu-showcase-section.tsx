"use client";

import Link from "next/link";
import type { MenuItem } from "@/types/content";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { getMenuItemHref } from "@/lib/menu/product-slug";
import { resolveMenuItemMediaUrl } from "@/lib/menu/normalize-menu";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { AutoplayVideo } from "@/components/shared/autoplay-video";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { useEffect, useRef } from "react";

type HomeMenuShowcaseSectionProps = {
  items: MenuItem[];
};

const PLACEHOLDER_IMAGE = "/images/menu/nb-menu-burger.png";

export function HomeMenuShowcaseSection({ items }: HomeMenuShowcaseSectionProps) {
  const { locale } = useLocale();
  const t = useTranslations();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const alignScrollStart = () => {
      track.scrollLeft = 0;
    };

    alignScrollStart();
    window.addEventListener("resize", alignScrollStart);

    return () => {
      window.removeEventListener("resize", alignScrollStart);
    };
  }, [items.length]);

  if (items.length === 0) {
    return (
      <section id="menu" className="menu-showcase-section" aria-labelledby="menu-showcase-title">
        <div className="menu-showcase-shell">
          <header className="menu-showcase-header">
            <h2 id="menu-showcase-title" className="menu-showcase-title">
              {t.menuShowcase.title}
            </h2>
            <p className="menu-showcase-lead">{t.menuShowcase.lead}</p>
          </header>
          <div className="menu-showcase-action">
            <Link className="site-cta-btn site-cta-btn--outline menu-showcase-button" href="/menu">
              <span className="site-cta-btn-label">{t.menuShowcase.fullMenu}</span>
              <span className="site-cta-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="menu-showcase-section" aria-labelledby="menu-showcase-title">
      <div className="menu-showcase-shell">
        <header className="menu-showcase-header">
          <h2 id="menu-showcase-title" className="menu-showcase-title">
            {t.menuShowcase.title}
          </h2>
          <p className="menu-showcase-lead">{t.menuShowcase.lead}</p>
        </header>

        <div className="menu-showcase-carousel" role="region" aria-label={t.menuShowcase.trackAria}>
          <div ref={trackRef} className="menu-showcase-track" tabIndex={0}>
            <div className="menu-showcase-rail" role="list">
              {items.map((item) => {
                const localized = getLocalizedMenuItem(item, locale);
                const media = resolveMenuItemMediaUrl(item.imageUrl, PLACEHOLDER_IMAGE);
                const isVideo = isVideoMediaUrl(media);

                return (
                  <article key={item.id} className="menu-showcase-card" role="listitem">
                    <Link href={getMenuItemHref(item)} className="menu-showcase-card-link">
                      <div
                        className={`menu-showcase-card-media${isVideo ? " menu-showcase-card-media--video" : ""}`}
                      >
                        {isVideo ? (
                          <div className="menu-showcase-card-video-frame">
                            <AutoplayVideo
                              className="menu-showcase-card-video"
                              src={media}
                              poster={PLACEHOLDER_IMAGE}
                              aria-hidden
                            />
                          </div>
                        ) : (
                          <MenuItemImage
                            decorative
                            src={media}
                            alt={localized.imageAlt}
                            width={640}
                            height={640}
                            sizes="(max-width: 767px) 67vw, 247px"
                            loading="eager"
                            className="menu-showcase-card-image"
                          />
                        )}
                      </div>
                      <h3 className="menu-showcase-card-name">{localized.name}</h3>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <div className="menu-showcase-action">
          <Link className="site-cta-btn site-cta-btn--outline menu-showcase-button" href="/menu">
            <span className="site-cta-btn-label">{t.menuShowcase.fullMenu}</span>
            <span className="site-cta-arrow" aria-hidden="true">
              ↗
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
