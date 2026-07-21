"use client";

import Link from "next/link";
import type { MenuItem } from "@/types/content";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { getMenuItemHref } from "@/lib/menu/product-slug";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { AutoplayVideo } from "@/components/shared/autoplay-video";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { useEffect, useRef } from "react";

type HomeMenuShowcaseSectionProps = {
  items: MenuItem[];
};

const PLACEHOLDER_IMAGE = "/images/menu/nb-menu-burger.png";
const NUDGE_INTERVAL_MS = 5000;
const NUDGE_CLASS = "menu-showcase-rail--nudge";

function canScrollHorizontally(track: HTMLElement): boolean {
  return track.scrollWidth > track.clientWidth + 2;
}

function isCoarsePointer(): boolean {
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

function scrollToStart(track: HTMLElement): void {
  track.scrollLeft = 0;
}

function isAtScrollStart(track: HTMLElement): boolean {
  return Math.abs(track.scrollLeft) <= 2;
}

export function HomeMenuShowcaseSection({ items }: HomeMenuShowcaseSectionProps) {
  const { locale } = useLocale();
  const t = useTranslations();
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const nudgePausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    const rail = railRef.current;
    if (!track || !rail || items.length < 2) {
      return;
    }

    const alignScrollStart = () => {
      scrollToStart(track);
      requestAnimationFrame(() => {
        scrollToStart(track);
      });
    };

    alignScrollStart();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const pauseNudge = () => {
      nudgePausedRef.current = true;
    };

    const resumeNudge = () => {
      window.setTimeout(() => {
        nudgePausedRef.current = false;
      }, 10000);
    };

    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName === "menu-showcase-nudge-hint") {
        rail.classList.remove(NUDGE_CLASS);
      }
    };

    const runNudge = () => {
      if (
        motionQuery.matches ||
        nudgePausedRef.current ||
        !isCoarsePointer() ||
        !canScrollHorizontally(track) ||
        !isAtScrollStart(track) ||
        rail.classList.contains(NUDGE_CLASS)
      ) {
        return;
      }

      rail.classList.add(NUDGE_CLASS);
    };

    track.addEventListener("touchstart", pauseNudge, { passive: true });
    track.addEventListener("pointerdown", pauseNudge);
    track.addEventListener("touchend", resumeNudge, { passive: true });
    track.addEventListener("pointerup", resumeNudge);
    rail.addEventListener("animationend", onAnimationEnd);

    const intervalId = window.setInterval(runNudge, NUDGE_INTERVAL_MS);
    const firstNudgeId = window.setTimeout(runNudge, 2000);
    window.addEventListener("resize", alignScrollStart);

    return () => {
      window.removeEventListener("resize", alignScrollStart);
      window.clearInterval(intervalId);
      window.clearTimeout(firstNudgeId);
      track.removeEventListener("touchstart", pauseNudge);
      track.removeEventListener("pointerdown", pauseNudge);
      track.removeEventListener("touchend", resumeNudge);
      track.removeEventListener("pointerup", resumeNudge);
      rail.removeEventListener("animationend", onAnimationEnd);
      rail.classList.remove(NUDGE_CLASS);
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
            <div ref={railRef} className="menu-showcase-rail" role="list">
              {items.map((item) => {
                const localized = getLocalizedMenuItem(item, locale);
                const media = item.imageUrl.trim() || PLACEHOLDER_IMAGE;
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
                              aria-label={localized.name}
                            />
                          </div>
                        ) : (
                          <MenuItemImage
                            src={media}
                            alt={localized.imageAlt}
                            width={640}
                            height={640}
                            sizes="(max-width: 767px) 67vw, 247px"
                            loading="lazy"
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
