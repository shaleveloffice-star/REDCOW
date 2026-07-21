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
        {VIBE_REELS.map((reelId, index) => (
          <div
            key={reelId}
            className={`home-vibe-card home-vibe-card--${index + 1} home-vibe-card--embed`}
          >
            <iframe
              src={`https://www.instagram.com/reel/${reelId}/embed/`}
              title={`Instagram Reel ${index + 1} של NB BURGER`}
              className="home-vibe-embed"
              loading="lazy"
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ))}
      </div>

      <a
        href={BUSINESS.social.instagram}
        className="home-vibe-cta"
        target="_blank"
        rel="noopener noreferrer"
      >
        <InstagramIcon />
        <span>FOLLOW US ON INSTAGRAM</span>
        <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
