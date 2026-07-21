import Image from "next/image";

import { BUSINESS } from "@/data/business";

const VIBE_IMAGES = [
  {
    src: "/images/plancha/plancha-sear.png",
    alt: "המבורגר נצרב על הפלנצ׳ה"
  },
  {
    src: "/images/hero/nb-burger-hero-spread.png",
    alt: "ארוחת המבורגרים של NB BURGER"
  },
  {
    src: "/images/atmosphere/atmosphere-third-1.png",
    alt: "לקוח יוצא מ-NB BURGER עם הזמנה"
  },
  {
    src: "/images/atmosphere/atmosphere-third-2.png",
    alt: "לקוח נהנה מהמבורגר במסעדה"
  }
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
        <div className="home-vibe-card home-vibe-card--1 home-vibe-card--embed">
          <iframe
            src="https://www.instagram.com/reel/DZJhDpgolz1/embed/"
            title="Instagram Reel של NB BURGER"
            className="home-vibe-embed"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        {VIBE_IMAGES.map((image, index) => (
          <a
            key={image.src}
            href={BUSINESS.social.instagram}
            className={`home-vibe-card home-vibe-card--${index + 2}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram — ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 700px) 78vw, (max-width: 1100px) 42vw, 28vw"
              className="home-vibe-image"
            />
            <span className="home-vibe-card-mark" aria-hidden="true">
              <InstagramIcon />
            </span>
          </a>
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
