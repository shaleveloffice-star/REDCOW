"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { mountModal } from "@/lib/a11y/focus-trap";
import { useLocale } from "@/components/providers/locale-provider";
import { getRecommendationPreviewVideo } from "@/lib/recommendations/preview-video";
import { resolveRecommendationEmbed } from "@/lib/recommendations/recommendation-embed";
import type { CreatorRecommendation } from "@/types/recommendations";

export function RecommendationVideoDialog({ item, trigger, onClose }: {
  item: CreatorRecommendation; trigger: HTMLElement | null; onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const titleId = useId();
  const { locale } = useLocale();
  const video = getRecommendationPreviewVideo(item);
  const embed = resolveRecommendationEmbed(item.contentUrl || "") || resolveRecommendationEmbed(item.mediaUrl || "");
  useLayoutEffect(() => {
    if (root.current && dialog.current) return mountModal(root.current, dialog.current, () => close.current(), trigger);
  }, [trigger]);

  return createPortal(
    <div className="creator-video-dialog-root" ref={root}>
      <div className="creator-video-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <h2 id={titleId} className="sr-only">{item.creatorName}</h2>
        <button className="creator-video-close" type="button" onClick={onClose}
          aria-label={locale === "he" ? "סגירת הסרטון" : locale === "fr" ? "Fermer la vidéo" : "Close video"}>×</button>
        {video ? <video src={video} controls autoPlay playsInline preload="auto" tabIndex={0} aria-label={item.creatorName} /> : embed ? (
          <iframe src={embed.src} title={item.creatorName} tabIndex={0} allow="autoplay; encrypted-media; picture-in-picture; web-share"
            allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        ) : null}
      </div>
    </div>, document.body
  );
}
