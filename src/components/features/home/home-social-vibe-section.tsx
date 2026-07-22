"use client";

import { useState } from "react";

import { BUSINESS } from "@/data/business";

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

export function HomeSocialVibeSection() {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const activeReelId = VIBE_REELS[activeReelIndex];

  const showPreviousReel = () => {
    setActiveReelIndex((current) => (current - 1 + VIBE_REELS.length) % VIBE_REELS.length);
  };

  const showNextReel = () => {
    setActiveReelIndex((current) => (current + 1) % VIBE_REELS.length);
  };

  return (
    <section className="home-vibe-section" aria-labelledby="home-vibe-title">
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
        <div
          key={activeReelId}
          className="home-vibe-card home-vibe-card--embed"
        >
          <span className="home-vibe-phone-island" aria-hidden="true" />
          <div className="home-vibe-phone-screen">
            <iframe
              src={`https://www.instagram.com/reel/${activeReelId}/embed/`}
              title={`Instagram Reel ${activeReelIndex + 1} של NB BURGER`}
              className="home-vibe-embed"
              loading="lazy"
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
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
