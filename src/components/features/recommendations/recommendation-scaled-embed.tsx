"use client";

import { useEffect, useRef, useState } from "react";
import type { RecommendationEmbedProvider } from "@/lib/recommendations/recommendation-embed";

/** Native Instagram/TikTok embed canvas — scaled to FIT (no inner scrollbar). */
const EMBED_SIZE: Record<RecommendationEmbedProvider, { width: number; height: number }> = {
  instagram: { width: 326, height: 720 },
  tiktok: { width: 325, height: 730 },
  youtube: { width: 360, height: 640 }
};

export function RecommendationScaledEmbed({
  src,
  title,
  provider
}: {
  src: string;
  title: string;
  provider: RecommendationEmbedProvider;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const design = EMBED_SIZE[provider];

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const update = () => {
      const w = node.clientWidth;
      const h = node.clientHeight;
      if (w < 2 || h < 2) return;
      // Contain: whole embed visible → no iframe scrollbar.
      setScale(Math.min(w / design.width, h / design.height));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [design.height, design.width]);

  return (
    <div ref={frameRef} className="recommendation-embed-fit">
      <iframe
        className="recommendation-vibe-embed"
        src={src}
        title={title}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="no-referrer"
        style={{
          width: design.width,
          height: design.height,
          transform: `scale(${scale})`
        }}
      />
    </div>
  );
}
