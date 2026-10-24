"use client";

import { useEffect, useRef, useState } from "react";
import type { RecommendationEmbedProvider } from "@/lib/recommendations/recommendation-embed";

/** Full native embed size, then crop chrome so only the reel video shows. */
const EMBED_SIZE: Record<
  RecommendationEmbedProvider,
  { width: number; height: number; cropTop: number; cropBottom: number }
> = {
  instagram: { width: 326, height: 700, cropTop: 54, cropBottom: 72 },
  tiktok: { width: 325, height: 730, cropTop: 0, cropBottom: 0 },
  youtube: { width: 360, height: 640, cropTop: 0, cropBottom: 0 }
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
  const [layout, setLayout] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const design = EMBED_SIZE[provider];
  const visibleHeight = design.height - design.cropTop - design.cropBottom;

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const update = () => {
      const nextWidth = node.clientWidth;
      const nextHeight = node.clientHeight;
      if (nextWidth < 2 || nextHeight < 2) return;
      // Cover the phone frame; overflow is clipped so IG header/footer stay hidden.
      const nextScale = Math.max(nextWidth / design.width, nextHeight / visibleHeight);
      setLayout({
        scale: nextScale,
        offsetX: (nextWidth - design.width * nextScale) / 2,
        offsetY: -design.cropTop * nextScale + (nextHeight - visibleHeight * nextScale) / 2
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [design.cropTop, design.height, design.width, visibleHeight]);

  return (
    <div ref={frameRef} className="recommendation-embed-scale">
      <iframe
        className="recommendation-card-media recommendation-card-media--embed"
        src={src}
        title={title}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="no-referrer"
        style={{
          width: design.width,
          height: design.height,
          transform: `translate(${layout.offsetX}px, ${layout.offsetY}px) scale(${layout.scale})`,
          transformOrigin: "top left"
        }}
      />
    </div>
  );
}
