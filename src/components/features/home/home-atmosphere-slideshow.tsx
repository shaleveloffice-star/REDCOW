"use client";

import { useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 3000;

type HomeAtmosphereSlideshowProps = {
  slides: string[];
};

export function HomeAtmosphereSlideshow({ slides }: HomeAtmosphereSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imagesReady, setImagesReady] = useState(slides.length <= 1);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (slides.length <= 1) {
      setImagesReady(true);
      return;
    }

    setImagesReady(false);

    Promise.all(
      slides.map(
        (src) =>
          new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = () => reject(new Error(`Failed to preload atmosphere image: ${src}`));
            image.src = src;
          })
      )
    )
      .then(() => {
        if (!cancelled) setImagesReady(true);
      })
      .catch(() => {
        // Keep the first image visible instead of transitioning to an unloaded image.
      });

    return () => {
      cancelled = true;
    };
  }, [slides]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => setReducedMotion(mediaQuery.matches);

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);
    return () => mediaQuery.removeEventListener("change", syncReducedMotion);
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || reducedMotion || !imagesReady) return;

    const timerId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [slides.length, reducedMotion, imagesReady]);

  if (slides.length === 0) return null;

  return (
    <div className="home-atmosphere-slideshow" aria-hidden="true">
      {slides.map((src, index) => (
        <img
          key={src}
          className={`home-atmosphere-slide${index === activeIndex ? " is-active" : ""}`}
          src={src}
          alt=""
          draggable={false}
        />
      ))}
    </div>
  );
}
