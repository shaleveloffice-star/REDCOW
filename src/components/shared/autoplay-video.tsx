"use client";

import { useEffect, useRef } from "react";

type AutoplayVideoProps = {
  src: string;
  className?: string;
  poster?: string;
  "aria-label"?: string;
};

export function AutoplayVideo({
  src,
  className,
  poster,
  "aria-label": ariaLabel
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise) {
        void playPromise.catch(() => {});
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          tryPlay();
        } else {
          video.pause();
        }
      },
      { threshold: 0.2, rootMargin: "8px" }
    );

    observer.observe(video);

    video.addEventListener("loadedmetadata", tryPlay);
    video.addEventListener("canplay", tryPlay);

    tryPlay();

    const onFirstTouch = () => {
      tryPlay();
      document.removeEventListener("touchstart", onFirstTouch);
    };

    document.addEventListener("touchstart", onFirstTouch, { passive: true });

    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("touchstart", onFirstTouch);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster={poster}
      aria-label={ariaLabel}
      disablePictureInPicture
      controlsList="nodownload noplaybackrate noremoteplayback"
    />
  );
}
