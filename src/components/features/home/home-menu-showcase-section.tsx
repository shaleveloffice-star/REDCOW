"use client";

import Image from "next/image";
import Link from "next/link";
import type { MenuItem } from "@/types/content";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { AutoplayVideo } from "@/components/shared/autoplay-video";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { useEffect, useRef, useState } from "react";

type HomeMenuShowcaseSectionProps = {
  items: MenuItem[];
};

const PLACEHOLDER_IMAGE = "/images/menu/nb-menu-burger.png";
const NUDGE_INTERVAL_MS = 5000;
const NUDGE_CLASS = "menu-showcase-rail--nudge";

function canScrollHorizontally(track: HTMLElement): boolean {
  return track.scrollWidth > track.clientWidth + 2;
}

function isMobileCarousel(): boolean {
  return window.matchMedia("(max-width: 767px)").matches;
}

function scrollToRtlStart(track: HTMLElement): void {
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
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollButtons = () => {
    const track = trackRef.current;
    if (!track) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    if (!canScrollHorizontally(track)) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const left = track.scrollLeft;
    // RTL scrollLeft can be 0 at start or negative depending on browser.
    const atStart = Math.abs(left) <= 2;
    const atEnd = Math.abs(Math.abs(left) - maxScroll) <= 2 || Math.abs(left + maxScroll) <= 2;

    setCanScrollPrev(!atStart);
    setCanScrollNext(!atEnd);
  };

  const scrollByCard = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>(".menu-showcase-card");
    const amount = card ? card.getBoundingClientRect().width + 16 : track.clientWidth * 0.8;
    const delta = direction === "next" ? amount : -amount;
    // In RTL, "next" visually moves toward older scroll position for start-aligned tracks.
    const isRtl = getComputedStyle(track).direction === "rtl";
    const signed = isRtl ? -delta : delta;

    track.scrollBy({ left: signed, behavior: "smooth" });
    nudgePausedRef.current = true;
    window.setTimeout(updateScrollButtons, 400);
  };

  useEffect(() => {
    const track = trackRef.current;
    const rail = railRef.current;
    if (!track || !rail || items.length < 2) {
      return;
    }

    const alignScrollStart = () => {
      if (!isMobileCarousel()) {
        return;
      }

      scrollToRtlStart(track);
      requestAnimationFrame(() => {
        scrollToRtlStart(track);
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
        !isMobileCarousel() ||
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
    track.addEventListener("scroll", updateScrollButtons, { passive: true });
    rail.addEventListener("animationend", onAnimationEnd);

    const intervalId = window.setInterval(runNudge, NUDGE_INTERVAL_MS);
    const firstNudgeId = window.setTimeout(runNudge, 2000);
    window.addEventListener("resize", alignScrollStart);
    window.addEventListener("resize", updateScrollButtons);
    updateScrollButtons();

    return () => {
      window.removeEventListener("resize", alignScrollStart);
      window.removeEventListener("resize", updateScrollButtons);
      window.clearInterval(intervalId);
      window.clearTimeout(firstNudgeId);
      track.removeEventListener("touchstart", pauseNudge);
      track.removeEventListener("pointerdown", pauseNudge);
      track.removeEventListener("touchend", resumeNudge);
      track.removeEventListener("pointerup", resumeNudge);
      track.removeEventListener("scroll", updateScrollButtons);
      rail.removeEventListener("animationend", onAnimationEnd);
      rail.classList.remove(NUDGE_CLASS);
    };
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section id="menu" className="menu-showcase-section" aria-labelledby="menu-showcase-title">
      <div className="menu-showcase-shell">
        <header className="menu-showcase-header">
          <p className="menu-showcase-kicker">NB BURGER</p>
          <h2 id="menu-showcase-title" className="menu-showcase-title">
            {t.menuShowcase.title}
          </h2>
          <p className="menu-showcase-lead">{t.menuShowcase.lead}</p>
        </header>

        <div className="menu-showcase-carousel" role="region" aria-label={t.menuShowcase.trackAria}>
          <div ref={trackRef} className="menu-showcase-track" tabIndex={-1}>
            <div ref={railRef} className="menu-showcase-rail" role="list">
              {items.map((item) => {
                const localized = getLocalizedMenuItem(item, locale);
                const media = item.imageUrl.trim() || PLACEHOLDER_IMAGE;
                const isVideo = isVideoMediaUrl(media);
                const isBestSeller = item.tags.some(
                  (tag) => tag === "מומלץ" || tag === "הכי נמכר"
                );

                return (
                  <article key={item.id} className="menu-showcase-card" role="listitem">
                    <div
                      className={`menu-showcase-card-media${isVideo ? " menu-showcase-card-media--video" : ""}`}
                    >
                      {isBestSeller ? (
                        <span className="menu-showcase-badge">{t.menuShowcase.bestSeller}</span>
                      ) : null}
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
                        <Image
                          src={media}
                          alt={localized.name}
                          width={640}
                          height={480}
                          sizes="(max-width: 767px) 80vw, 280px"
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                    <div className="menu-showcase-card-body">
                      <h3 className="menu-showcase-card-title">{localized.name}</h3>
                      {localized.description ? (
                        <p className="menu-showcase-card-desc">{localized.description}</p>
                      ) : null}
                      <p className="menu-showcase-card-price">
                        <span>{item.price}</span>
                        <span className="menu-showcase-card-currency">₪</span>
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {items.length > 1 ? (
            <div className="menu-showcase-controls">
              <button
                type="button"
                className="menu-showcase-control"
                aria-label={t.menuShowcase.prev}
                disabled={!canScrollPrev}
                onClick={() => scrollByCard("prev")}
              >
                ‹
              </button>
              <button
                type="button"
                className="menu-showcase-control"
                aria-label={t.menuShowcase.next}
                disabled={!canScrollNext}
                onClick={() => scrollByCard("next")}
              >
                ›
              </button>
            </div>
          ) : null}
        </div>

        <div className="menu-showcase-action">
          <Link className="menu-showcase-button" href="/menu">
            {t.menuShowcase.fullMenu}
          </Link>
        </div>
      </div>
    </section>
  );
}
