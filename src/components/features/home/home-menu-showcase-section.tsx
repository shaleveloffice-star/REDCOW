"use client";

import Link from "next/link";
import type { MenuCategory, MenuItem } from "@/types/content";
import {
  MENU_TOUR_SCROLL_EVENT,
  type MenuTourScrollDetail,
  scrollMenuTrackToIndex,
  scrollMenuTrackToEnd,
  scrollMenuTrackToStart
} from "@/lib/menu-showcase-tour";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { AutoplayVideo } from "@/components/shared/autoplay-video";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { useEffect, useMemo, useRef } from "react";

type MenuGroup = MenuCategory & { items: MenuItem[] };

type HomeMenuShowcaseSectionProps = {
  groups: MenuGroup[];
};

const PLACEHOLDER_IMAGE = "/images/menu/placeholder.svg";
const NUDGE_INTERVAL_MS = 5000;
const NUDGE_CLASS = "menu-showcase-rail--nudge";

const HOMEPAGE_MENU_ITEM_IDS = [
  "item-redcow-classic",
  "item-fries",
  "item-crispy-chicken",
  "item-nuggets"
] as const;

function getHomepageMenuItems(groups: MenuGroup[]): MenuItem[] {
  const itemsById = new Map(
    groups
      .flatMap((group) => group.items)
      .filter((item) => item.isActive)
      .map((item) => [item.id, item] as const)
  );

  return HOMEPAGE_MENU_ITEM_IDS.flatMap((id) => {
    const item = itemsById.get(id);
    return item ? [item] : [];
  });
}

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

export function HomeMenuShowcaseSection({ groups }: HomeMenuShowcaseSectionProps) {
  const { locale } = useLocale();
  const t = useTranslations();
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const nudgePausedRef = useRef(false);

  const items = useMemo(() => getHomepageMenuItems(groups), [groups]);

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

  useEffect(() => {
    const onTourScroll = (event: Event) => {
      const track = trackRef.current;
      if (!track) return;

      const detail = (event as CustomEvent<MenuTourScrollDetail>).detail;
      if (!detail) return;

      nudgePausedRef.current = true;

      if (detail.action === "reset") {
        scrollMenuTrackToStart(track, detail.smooth ?? true);
        return;
      }

      if (detail.action === "end") {
        requestAnimationFrame(() => {
          scrollMenuTrackToEnd(track, detail.smooth ?? true);
        });
        return;
      }

      if (detail.action === "goto" && typeof detail.index === "number") {
        requestAnimationFrame(() => {
          scrollMenuTrackToIndex(track, detail.index!, detail.smooth ?? true);
        });
      }
    };

    window.addEventListener(MENU_TOUR_SCROLL_EVENT, onTourScroll);
    return () => window.removeEventListener(MENU_TOUR_SCROLL_EVENT, onTourScroll);
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

        <div ref={trackRef} className="menu-showcase-track" aria-label={t.menuShowcase.trackAria}>
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
                          aria-label={localized.name}
                        />
                      </div>
                    ) : (
                      <img src={media} alt={localized.name} loading="lazy" />
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

        <div className="menu-showcase-action">
          <Link className="menu-showcase-button" href="/menu">
            {t.menuShowcase.fullMenu}
          </Link>
        </div>
      </div>
    </section>
  );
}
