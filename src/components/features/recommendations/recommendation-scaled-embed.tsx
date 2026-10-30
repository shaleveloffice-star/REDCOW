"use client";

import { useEffect, useRef, useState } from "react";
import type { RecommendationEmbedProvider } from "@/lib/recommendations/recommendation-embed";

/** Fit the complete provider player into the compact card, including its controls. */
export function RecommendationScaledEmbed({ src, title, provider }: {
  src: string;
  title: string;
  provider: RecommendationEmbedProvider;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () => setScale(Math.min(element.clientWidth / 326, element.clientHeight / 700));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={viewport} className="recommendation-embed-viewport">
    <iframe
      style={{ position: "absolute", width: 326, height: 700, top: "50%", left: "50%", transform: `translate(-50%, -50%) scale(${scale})`, visibility: scale ? "visible" : "hidden" }}
      className={`recommendation-square-embed recommendation-square-embed--${provider}`}
      src={src}
      title={title}
      loading="lazy"
      allow="autoplay; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
    </div>
  );
}
