"use client";

import { useEffect, useRef, useState } from "react";

import { BUSINESS } from "@/data/business";
import { trackEvent } from "@/lib/analytics";

const VIBE_REELS = [
  "DZJhDpgolz1",
  "DZGEerQx4ro",
  "DZG6jdooaVB",
  "DZHtdgxN0Lw",
  "DZJg3oKo5gH"
] as const;

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" />
    </svg>
  );
}

function ReelEmbed({
  reelId,
  title,
  className,
  enabled
}: {
  reelId: string;
  title: string;
  className?: string;
  enabled: boolean;
}) {
  if (!enabled) {
    return (
      <div
        className={className ? `${className} home-vibe-embed-placeholder` : "home-vibe-embed-placeholder"}
        aria-hidden="true"
      />
    );
  }

  return (
    <iframe
      src={`https://www.instagram.com/reel/${reelId}/embed/`}
      title={title}
      className={className}
      loading="lazy"
      scrolling="no"
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

export function HomeSocialVibeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [sectionNearView, setSectionNearView] = useState(false);
  const [secondaryEmbedReady, setSecondaryEmbedReady] = useState(false);
  const activeReelId = VIBE_REELS[activeReelIndex];
  const secondaryReelIndex = (activeReelIndex + 1) % VIBE_REELS.length;
  const secondaryReelId = VIBE_REELS[secondaryReelIndex];

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSectionNearView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sectionNearView) return;
    // Defer the second iframe so Samsung / mid-tier devices are not hit with two embeds at once.
    const timer = window.setTimeout(() => setSecondaryEmbedReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, [sectionNearView, activeReelIndex]);

  const showPreviousReel = () => {
    setSecondaryEmbedReady(false);
    setActiveReelIndex((current) => (current - 1 + VIBE_REELS.length) % VIBE_REELS.length);
  };

  const showNextReel = () => {
    setSecondaryEmbedReady(false);
    setActiveReelIndex((current) => (current + 1) % VIBE_REELS.length);
  };

  return (
    <section
      ref={sectionRef}
      className="home-vibe-section"
      aria-labelledby="home-vibe-title"
    >
      <header className="home-vibe-header">
        <div>
          <p className="home-vibe-handle">@NBBURGERIL</p>
          <h2 id="home-vibe-title" className="home-vibe-title">
            FOLLOW THE VIBE
          </h2>
        </div>
        <p className="home-vibe-tagline">GOOD FOOD. GOOD PEOPLE. GOOD TIMES.</p>
      </header>

      <div className="home-vibe-gallery">
        <div key={activeReelId} className="home-vibe-card home-vibe-card--embed">
          <span className="home-vibe-phone-island" aria-hidden="true" />
          <div className="home-vibe-phone-screen">
            <ReelEmbed
              reelId={activeReelId}
              title={`Instagram Reel ${activeReelIndex + 1} של NB BURGER`}
              className="home-vibe-embed"
              enabled={sectionNearView}
            />
            <ReelEmbed
              reelId={secondaryReelId}
              title={`Instagram Reel ${secondaryReelIndex + 1} של NB BURGER`}
              className="home-vibe-embed home-vibe-embed--secondary"
              enabled={sectionNearView && secondaryEmbedReady}
            />
          </div>
        </div>
      </div>

      <div className="home-vibe-controls" aria-label="ניווט בין סרטוני Instagram">
        <button type="button" onClick={showPreviousReel} aria-label="הסרטון הקודם">
          <span aria-hidden="true">←</span>
        </button>
        <span className="home-vibe-counter" aria-live="polite">
          {String(activeReelIndex + 1).padStart(2, "0")} / {String(VIBE_REELS.length).padStart(2, "0")}
        </span>
        <button type="button" onClick={showNextReel} aria-label="הסרטון הבא">
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <a
        href={BUSINESS.social.instagram}
        className="home-vibe-cta"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackEvent("social_click", {
            source: "home_social",
            network: "instagram"
          })
        }
      >
        <InstagramIcon />
        <span>
          FOLLOW US ON <span className="home-vibe-instagram-word">INSTAGRAM</span>
        </span>
        <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
