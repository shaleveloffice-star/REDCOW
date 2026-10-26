"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { getRecommendationPreviewVideo } from "@/lib/recommendations/preview-video";
import { resolveRecommendationEmbed } from "@/lib/recommendations/recommendation-embed";
import type { CreatorRecommendation } from "@/types/recommendations";
import { RecommendationVideoDialog } from "@/components/features/recommendations/recommendation-video-dialog";

export function HomeRecommendationsSection({ items }: { items: CreatorRecommendation[] }) {
  const { locale } = useLocale();
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [selected, setSelected] = useState<CreatorRecommendation | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const copy = locale === "he"
    ? { all: "לכל ההמלצות", pause: "עצירת הסרטונים", play: "הפעלת הסרטונים", next: "המלצות נוספות" }
    : locale === "fr"
      ? { all: "Tous les avis", pause: "Pause des vidéos", play: "Lire les vidéos", next: "Autres avis" }
      : { all: "All recommendations", pause: "Pause videos", play: "Play videos", next: "More recommendations" };
  const canRotate = items.length > 3;
  const hasNativeVideo = items.some((item) => getRecommendationPreviewVideo(item));

  useEffect(() => {
    if (!canRotate || paused || interacting || selected) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (document.hidden || reducedMotion.matches ||
          document.documentElement.getAttribute("data-a11y-motion") === "reduce" ||
          !rect || rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      setStart((value) => (value + 3) % items.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [canRotate, items.length, paused, interacting, selected]);

  if (!items.length) return null;
  const visible = Array.from({ length: Math.min(3, items.length) }, (_, i) => items[(start + i) % items.length]);

  return (
    <section ref={sectionRef} className="home-creators" aria-labelledby="home-creators-title"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
      <div className="home-creators-heading">
        <h2 id="home-creators-title">{t.nav.recommendations}</h2>
        <Link href="/recommendations">{copy.all}</Link>
      </div>
      <ul className="home-creators-grid">
        {visible.map((item) => {
          const video = getRecommendationPreviewVideo(item);
          const embed = resolveRecommendationEmbed(item.contentUrl || "") || resolveRecommendationEmbed(item.mediaUrl || "");
          return (
            <li key={item.id}>
              <div className="home-creator-image">
                {video ? <CreatorVideo src={video} paused={paused || Boolean(selected)} /> : embed ? (
                  <CreatorEmbed src={embed.src} title={item.creatorName} />
                ) : <img src={item.mediaUrl} alt={item.mediaAlt || item.creatorName} loading="lazy" />}
                {video || embed ? <button type="button" className="home-creator-open"
                  aria-label={`${locale === "he" ? "פתיחת הסרטון במסך מלא" : locale === "fr" ? "Ouvrir la vidéo en plein écran" : "Open video full screen"}: ${item.creatorName}`}
                  aria-haspopup="dialog"
                  onClick={(event) => { trigger.current = event.currentTarget; setSelected(item); }} /> : null}
              </div>
              <Link href={`/recommendations#creator-${encodeURIComponent(item.id)}`} className="home-creator home-creator-name">
                {item.creatorName}
              </Link>
            </li>
          );
        })}
      </ul>
      {hasNativeVideo || canRotate ? <div className="home-creators-controls">
        <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? copy.play : copy.pause}</button>
        {canRotate ? <button type="button" onClick={() => setStart((value) => (value + 3) % items.length)}>{copy.next}</button> : null}
      </div> : null}
      {selected ? <RecommendationVideoDialog item={selected} trigger={trigger.current} onClose={() => setSelected(null)} /> : null}
    </section>
  );
}

function CreatorEmbed({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [nearView, setNearView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    // Browser iframe lazy loading can fetch several screens ahead of the hero.
    // Start the actual embed only as its fixed-size card enters the viewport.
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearView(true); visibility.disconnect(); }
    }, { rootMargin: "0px", threshold: 0.01 });
    visibility.observe(element);
    return () => { observer.disconnect(); visibility.disconnect(); };
  }, []);
  return <div ref={ref} className="home-creator-embed">
    {nearView ? <iframe src={src} title={`Video: ${title}`} loading="eager" tabIndex={-1} aria-hidden="true"
      allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      style={{ width: 326, height: 700, transform: `scale(${width / 326})` }} /> : null}
  </div>;
}

function CreatorVideo({ src, paused }: { src: string; paused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let inView = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (paused || !inView || document.hidden || motion.matches || document.documentElement.getAttribute("data-a11y-motion") === "reduce") {
        video.pause();
      } else {
        video.muted = true;
        void video.play().catch(() => { /* Browser power-saving may prevent autoplay. */ });
      }
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: 0.2 });
    observer.observe(video);
    const accessibility = new MutationObserver(sync);
    accessibility.observe(document.documentElement, { attributes: true, attributeFilter: ["data-a11y-motion"] });
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    video.addEventListener("canplay", sync);
    return () => {
      observer.disconnect(); accessibility.disconnect(); video.pause();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      video.removeEventListener("canplay", sync);
    };
  }, [src, paused]);
  return <video ref={ref} src={src} muted loop playsInline preload="metadata" aria-hidden="true" />;
}
