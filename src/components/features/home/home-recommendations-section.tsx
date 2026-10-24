"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { CreatorRecommendation } from "@/types/recommendations";

export function HomeRecommendationsSection({ items }: { items: CreatorRecommendation[] }) {
  const { locale } = useLocale();
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const copy = locale === "he"
    ? { all: "לכל ההמלצות", pause: "עצירת החלפה אוטומטית", play: "הפעלת החלפה אוטומטית", next: "המלצות נוספות" }
    : locale === "fr"
      ? { all: "Tous les avis", pause: "Arrêter le défilement", play: "Reprendre le défilement", next: "Autres avis" }
      : { all: "All recommendations", pause: "Pause rotation", play: "Resume rotation", next: "More recommendations" };
  const canRotate = items.length > 3;

  useEffect(() => {
    if (!canRotate || paused || interacting) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (document.hidden || reducedMotion.matches ||
          document.documentElement.getAttribute("data-a11y-motion") === "reduce" ||
          !rect || rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      setStart((value) => (value + 3) % items.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [canRotate, items.length, paused, interacting]);

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
          const video = item.mediaType === "video" || isVideoMediaUrl(item.mediaUrl);
          const image = item.posterUrl || (!video ? item.mediaUrl : "");
          return (
            <li key={item.id}>
              <Link href={`/recommendations#creator-${encodeURIComponent(item.id)}`} className="home-creator">
                <span className="home-creator-image">
                  {image ? <img src={image} alt="" loading="lazy" />
                    : video && item.mediaUrl ? <video src={item.mediaUrl} muted playsInline preload="metadata" aria-hidden="true" />
                      : <span className="home-creator-initials" aria-hidden="true">{item.creatorName.split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0]).join("")}</span>}
                </span>
                <span className="home-creator-name">{item.creatorName}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {canRotate ? <div className="home-creators-controls">
        <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? copy.play : copy.pause}</button>
        <button type="button" onClick={() => setStart((value) => (value + 3) % items.length)}>{copy.next}</button>
      </div> : null}
    </section>
  );
}
