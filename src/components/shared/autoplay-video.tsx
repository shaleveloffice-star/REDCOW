"use client";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "@/components/providers/locale-provider";
import { videoSourcesForMp4 } from "@/lib/video-sources";

type AutoplayVideoProps = {
  src: string;
  className?: string;
  poster?: string;
  preload?: "auto" | "metadata" | "none";
  "aria-label"?: string;
  "aria-hidden"?: boolean;
};

/** Cap concurrent muted autoplay loops to reduce mid-tier Android jank. */
const MAX_CONCURRENT_AUTOPLAY = 1;
const playingVideos = new Set<HTMLVideoElement>();

function claimPlaybackSlot(video: HTMLVideoElement) {
  if (playingVideos.has(video)) return;
  if (playingVideos.size >= MAX_CONCURRENT_AUTOPLAY) {
    for (const other of [...playingVideos]) {
      if (other === video) continue;
      other.pause();
      playingVideos.delete(other);
      if (playingVideos.size < MAX_CONCURRENT_AUTOPLAY) break;
    }
  }
  playingVideos.add(video);
}

function releasePlaybackSlot(video: HTMLVideoElement) {
  playingVideos.delete(video);
}

export function AutoplayVideo({
  src,
  className,
  poster,
  preload = "none",
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden
}: AutoplayVideoProps) {
  const t = useTranslations();
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPausedRef = useRef(false);
  const inViewRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const html = document.documentElement;
    const sync = () => {
      const prefersReduced =
        mediaQuery.matches || html.getAttribute("data-a11y-motion") === "reduce";
      setReducedMotion(prefersReduced);
      userPausedRef.current = prefersReduced;
      setPaused(prefersReduced);
    };
    sync();
    mediaQuery.addEventListener("change", sync);
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["data-a11y-motion"] });
    return () => {
      mediaQuery.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const syncPaused = () => {
      setPaused(video.paused);
      if (video.paused) {
        releasePlaybackSlot(video);
      }
    };

    const tryPlay = () => {
      if (userPausedRef.current || reducedMotion || !inViewRef.current) {
        video.pause();
        releasePlaybackSlot(video);
        setPaused(true);
        return;
      }
      claimPlaybackSlot(video);
      const playPromise = video.play();
      if (playPromise) {
        void playPromise.catch(() => {
          releasePlaybackSlot(video);
        });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          tryPlay();
        } else {
          video.pause();
          releasePlaybackSlot(video);
        }
      },
      { threshold: 0.2, rootMargin: "8px" }
    );

    observer.observe(video);

    video.addEventListener("play", syncPaused);
    video.addEventListener("pause", syncPaused);
    video.addEventListener("loadedmetadata", tryPlay);
    video.addEventListener("canplay", tryPlay);

    // Do not call load()/tryPlay until in view — IO will start playback.
    inViewRef.current = false;

    const onFirstTouch = () => {
      tryPlay();
      document.removeEventListener("touchstart", onFirstTouch);
    };

    document.addEventListener("touchstart", onFirstTouch, { passive: true });

    return () => {
      observer.disconnect();
      releasePlaybackSlot(video);
      video.removeEventListener("play", syncPaused);
      video.removeEventListener("pause", syncPaused);
      video.removeEventListener("loadedmetadata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("touchstart", onFirstTouch);
    };
  }, [src, reducedMotion]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      userPausedRef.current = false;
      claimPlaybackSlot(video);
      const playPromise = video.play();
      if (playPromise) {
        void playPromise.catch(() => {
          releasePlaybackSlot(video);
        });
      }
      setPaused(false);
      return;
    }

    userPausedRef.current = true;
    video.pause();
    releasePlaybackSlot(video);
    setPaused(true);
  };

  return (
    <div className="autoplay-video-wrap">
      <video
        ref={videoRef}
        className={className}
        autoPlay={false}
        loop
        muted
        playsInline
        controls={false}
        preload={preload}
        poster={poster}
        aria-label={ariaHidden ? undefined : ariaLabel}
        aria-hidden={ariaHidden ? true : undefined}
        data-autoplay-video=""
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
      >
        {videoSourcesForMp4(src).map((source) => (
          <source key={source.type} src={source.src} type={source.type} />
        ))}
      </video>
      <button
        type="button"
        className="autoplay-video-toggle"
        aria-label={paused ? t.a11y.playVideo : t.a11y.pauseVideo}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          togglePlayback();
        }}
      >
        {paused ? (
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path fill="currentColor" d="M8 5.5v13l11-6.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
