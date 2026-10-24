"use client";

import { useEffect, useRef, useState } from "react";
import type { RecommendationEmbedProvider } from "@/lib/recommendations/recommendation-embed";

/** Native embed design sizes — scale down so the full player fits without iframe scroll. */
const EMBED_SIZE: Record<RecommendationEmbedProvider, { width: number; height: number }> = {
  instagram: { width: 326, height: 680 },
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
  const [offsetX, setOffsetX] = useState(0);
  const design = EMBED_SIZE[provider];

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const update = () => {
      const nextWidth = node.clientWidth;
      const nextHeight = node.clientHeight;
      if (nextWidth < 2 || nextHeight < 2) return;
      const nextScale = Math.min(nextWidth / design.width, nextHeight / design.height);
      setScale(nextScale);
      setOffsetX((nextWidth - design.width * nextScale) / 2);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [design.height, design.width]);

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
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          marginInlineStart: offsetX
        }}
      />
    </div>
  );
}
