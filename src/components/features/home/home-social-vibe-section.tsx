"use client";

import { useEffect, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics";

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/sowhat.il?vrfl=MTU0cXpzYXM4enhiaw==";
const INSTAGRAM_EMBED_URL = "https://www.instagram.com/sowhat.il/embed/";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" />
    </svg>
  );
}

function ProfileEmbed({
  title,
  className,
  enabled
}: {
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
      src={INSTAGRAM_EMBED_URL}
      title={title}
      className={className}
      loading="lazy"
      scrolling="no"
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="no-referrer"
    />
  );
}

export function HomeSocialVibeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [sectionNearView, setSectionNearView] = useState(false);

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

  return (
    <section
      ref={sectionRef}
      className="home-vibe-section"
      aria-labelledby="home-vibe-title"
    >
      <header className="home-vibe-header">
        <div>
          <p className="home-vibe-handle">@sowhat.il</p>
          <h2 id="home-vibe-title" className="home-vibe-title">
            FOLLOW THE VIBE
          </h2>
        </div>
        <p className="home-vibe-tagline">GOOD FOOD. GOOD PEOPLE. GOOD TIMES.</p>
      </header>

      <div className="home-vibe-gallery">
        <div className="home-vibe-card home-vibe-card--embed">
          <span className="home-vibe-phone-island" aria-hidden="true" />
          <div className="home-vibe-phone-screen home-vibe-phone-screen--profile">
            <ProfileEmbed
              title="Instagram — @sowhat.il"
              className="home-vibe-embed"
              enabled={sectionNearView}
            />
          </div>
        </div>
      </div>

      <a
        href={INSTAGRAM_PROFILE_URL}
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
