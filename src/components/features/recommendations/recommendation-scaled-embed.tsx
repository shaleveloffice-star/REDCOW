"use client";

import { useEffect, useRef, useState } from "react";
import type { RecommendationEmbedProvider } from "@/lib/recommendations/recommendation-embed";

const EMBED_SIZE: Record<RecommendationEmbedProvider, { width: number; height: number }> = {
  instagram: { width: 326, height: 700 },
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
  const [layout, setLayout] = useState({ scale: 1, top: 0, left: 0 });
  const design = EMBED_SIZE[provider];

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const update = () => {
      const boxW = node.clientWidth;
      const boxH = node.clientHeight;
      if (boxW < 2 || boxH < 2) return;

      // Cover the phone screen — no black gaps, overflow clipped (no scroll).
      const scale = Math.max(boxW / design.width, boxH / design.height);
      setLayout({
        scale,
        top: (boxH - design.height * scale) / 2,
        left: (boxW - design.width * scale) / 2
      });
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
          top: layout.top,
          left: layout.left,
          transform: `scale(${layout.scale})`
        }}
      />
    </div>
  );
}
