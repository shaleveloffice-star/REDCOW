"use client";

import { useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 3000;
const CROSS_FADE_MS = 1200;

type HomeAtmosphereSlideshowProps = {
  slides: string[];
};

export function HomeAtmosphereSlideshow({ slides }: HomeAtmosphereSlideshowProps) {
  const [baseIndex, setBaseIndex] = useState(0);
  const [overlayIndex, setOverlayIndex] = useState(slides.length > 1 ? 1 : 0);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayResetting, setOverlayResetting] = useState(false);
  const [imagesReady, setImagesReady] = useState(slides.length <= 1);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setBaseIndex(0);
    setOverlayIndex(slides.length > 1 ? 1 : 0);
    setOverlayVisible(false);
    setOverlayResetting(false);

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
            image.onload = () => {
              image.decode().then(resolve).catch(resolve);
            };
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

    let cancelled = false;
    let currentIndex = 0;
    const timerIds: number[] = [];
    const frameIds: number[] = [];

    const after = (delay: number, callback: () => void) => {
      const timerId = window.setTimeout(callback, delay);
      timerIds.push(timerId);
    };

    const onNextFrame = (callback: () => void) => {
      const frameId = window.requestAnimationFrame(callback);
      frameIds.push(frameId);
    };

    const scheduleNextSlide = () => {
      after(SLIDE_INTERVAL_MS, () => {
        if (cancelled) return;

        const nextIndex = (currentIndex + 1) % slides.length;

        setOverlayResetting(true);
        setOverlayVisible(false);
        setOverlayIndex(nextIndex);

        onNextFrame(() => {
          onNextFrame(() => {
            if (cancelled) return;

            setOverlayResetting(false);
            setOverlayVisible(true);

            after(CROSS_FADE_MS, () => {
              if (cancelled) return;

              currentIndex = nextIndex;
              setBaseIndex(nextIndex);
              setOverlayResetting(true);
              setOverlayVisible(false);

              onNextFrame(() => {
                if (cancelled) return;
                setOverlayResetting(false);
                scheduleNextSlide();
              });
            });
          });
        });
      });
    };

    scheduleNextSlide();

    return () => {
      cancelled = true;
      timerIds.forEach(window.clearTimeout);
      frameIds.forEach(window.cancelAnimationFrame);
    };
  }, [slides.length, reducedMotion, imagesReady]);

  if (slides.length === 0) return null;

  return (
    <div className="home-atmosphere-slideshow" aria-hidden="true">
      <img
        className="home-atmosphere-slide home-atmosphere-slide--base"
        src={slides[baseIndex]}
        alt=""
        draggable={false}
      />
      <img
        className={`home-atmosphere-slide home-atmosphere-slide--overlay${
          overlayVisible ? " is-visible" : ""
        }${overlayResetting ? " is-resetting" : ""}`}
        src={slides[overlayIndex]}
        alt=""
        draggable={false}
      />
    </div>
  );
}
