"use client";

import { useEffect, type RefObject } from "react";
import { videoTrimBounds } from "@/lib/video-trim";

/** Restrict playback without altering the uploaded file. */
export function useVideoTrim(ref: RefObject<HTMLVideoElement | null>, src: string, start = 0, end: number | null = null) {
  useEffect(() => {
    const video = ref.current;
    if (!video || (start === 0 && end === null)) return;
    let frame = 0;
    const enforce = () => {
      const bounds = videoTrimBounds({ start, end }, video.duration);
      if (bounds.end === null || video.seeking) return;
      if (video.currentTime < bounds.start || video.currentTime >= bounds.end) {
        video.currentTime = bounds.start;
      }
    };
    const tick = () => {
      enforce();
      if (!video.paused) frame = requestAnimationFrame(tick);
    };
    const onPlay = () => { cancelAnimationFrame(frame); tick(); };
    const onPause = () => cancelAnimationFrame(frame);
    const onEnded = () => {
      enforce();
      void video.play().catch(() => {});
    };
    enforce();
    video.addEventListener("loadedmetadata", enforce);
    video.addEventListener("timeupdate", enforce);
    video.addEventListener("seeked", enforce);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    if (!video.paused) onPlay();
    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener("loadedmetadata", enforce);
      video.removeEventListener("timeupdate", enforce);
      video.removeEventListener("seeked", enforce);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [ref, src, start, end]);
}
