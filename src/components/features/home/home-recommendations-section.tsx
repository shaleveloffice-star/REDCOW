"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { creatorSlot } from "@/lib/recommendations/continuous-carousel";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { isPressRecommendation } from "@/lib/recommendations/content-kind";
import { getRecommendationPreviewVideo } from "@/lib/recommendations/preview-video";
import { resolveRecommendationEmbed } from "@/lib/recommendations/recommendation-embed";
import { isSafePublicHref } from "@/lib/security/safe-url";
import type { CreatorRecommendation } from "@/types/recommendations";
import { RecommendationVideoDialog } from "@/components/features/recommendations/recommendation-video-dialog";

export function HomeRecommendationsSection({ items }: { items: CreatorRecommendation[] }) {
  const { locale } = useLocale();
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const distance = useRef(0);
  const stopped = useRef(false);
  const [pageSize, setPageSize] = useState(3);
  const [interacting, setInteracting] = useState(false);
  const [selected, setSelected] = useState<CreatorRecommendation | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const copy = locale === "he"
    ? { all: "לכל ההמלצות" }
    : locale === "fr"
      ? { all: "Tous les avis" }
      : { all: "All recommendations" };
  const canRotate = items.length > pageSize;
  stopped.current = interacting || Boolean(selected);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 900px)");
    const sync = () => setPageSize(wide.matches ? 5 : 3);
    sync();
    wide.addEventListener("change", sync);
    return () => wide.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, previous = 0;
    const animate = (now: number) => {
      const delta = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      const rect = track.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = (rect.width + gap) / pageSize;
      if (canRotate && step > 0 && !stopped.current && !document.hidden &&
          !motion.matches && document.documentElement.getAttribute("data-a11y-motion") !== "reduce" &&
          rect.bottom > 0 && rect.top < window.innerHeight) {
        distance.current = (distance.current + delta * 0.016 / step) % items.length;
      }
      Array.from(track.children).forEach((child, index) => {
        const slot = canRotate ? creatorSlot(index, distance.current, items.length) : index;
        (child as HTMLElement).style.setProperty("--creator-slot", String(slot));
        (child as HTMLElement).inert = slot <= -1 || slot >= pageSize;
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [canRotate, items.length, pageSize]);

  if (!items.length) return null;

  return (
    <section ref={sectionRef} className="home-creators" aria-labelledby="home-creators-title"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
      <div className="home-creators-heading">
        <h2 id="home-creators-title">{locale === "he" ? "מדברים עלינו" : t.nav.recommendations}</h2>
        <Link href="/recommendations">{copy.all}</Link>
      </div>
      <ul ref={trackRef} className="home-creators-grid">
        {items.map((item, index) => {
          const active = true;

          if (isPressRecommendation(item)) {
            const href = isSafePublicHref(item.contentUrl) ? item.contentUrl : `/recommendations#creator-${encodeURIComponent(item.id)}`;
            const external = href.startsWith("http");
            return (
              <li
                key={item.id}
                dir={locale === "he" ? "rtl" : "ltr"}
                style={{ "--creator-slot": index } as CSSProperties}
                aria-hidden={active ? undefined : true}
                data-carousel-active={active ? "true" : "false"}
              >
                <a
                  href={href}
                  className="home-creator"
                  tabIndex={active ? undefined : -1}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <div className="home-creator-image">
                    {item.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.mediaUrl} alt={item.mediaAlt || item.articleTitle || item.creatorName} loading="lazy" />
                    ) : (
                      <span className="home-creator-initials" aria-hidden="true">
                        {(item.creatorName || "?").slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <span className="home-creator-name">{item.creatorName}</span>
                </a>
              </li>
            );
          }

          const video = getRecommendationPreviewVideo(item);
          const embed = resolveRecommendationEmbed(item.contentUrl || "") || resolveRecommendationEmbed(item.mediaUrl || "");
          return (
            <li
              key={item.id}
              dir={locale === "he" ? "rtl" : "ltr"}
              style={{ "--creator-slot": index } as CSSProperties}
              aria-hidden={active ? undefined : true}
              data-carousel-active={active ? "true" : "false"}
            >
              <div className="home-creator-image">
                {video ? (
                  <CreatorVideo src={video} active={active} paused={Boolean(selected)} />
                ) : embed?.provider === "tiktok" ? (
                  <iframe className="home-creator-tiktok" src={embed.src} title={`TikTok: ${item.creatorName}`}
                    loading="lazy" tabIndex={-1} allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
                ) : embed ? (
                  <CreatorEmbed src={embed.src} title={item.creatorName} active={active} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.mediaUrl} alt={item.mediaAlt || item.creatorName} loading="lazy" />
                )}
                {video || embed ? (
                  <button
                    type="button"
                    className="home-creator-open"
                    tabIndex={active ? undefined : -1}
                    aria-label={`${locale === "he" ? "פתיחת הסרטון במסך מלא" : locale === "fr" ? "Ouvrir la vidéo en plein écran" : "Open video full screen"}: ${item.creatorName}`}
                    aria-haspopup="dialog"
                    onClick={(event) => { trigger.current = event.currentTarget; setSelected(item); }}
                  />
                ) : null}
              </div>
              <Link
                href={`/recommendations#creator-${encodeURIComponent(item.id)}`}
                className="home-creator home-creator-name"
                tabIndex={active ? undefined : -1}
              >
                {item.creatorName}
              </Link>
              {embed?.provider === "tiktok" ? <a className="home-creator-tiktok-link" href={embed.watchUrl || embed.src}
                target="_blank" rel="noopener noreferrer">לצפייה בטיקטוק</a> : null}
            </li>
          );
        })}
      </ul>
      {selected ? <RecommendationVideoDialog item={selected} trigger={trigger.current} onClose={() => setSelected(null)} /> : null}
    </section>
  );
}

function CreatorEmbed({ src, title, active }: { src: string; title: string; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  // Once loaded, keep the iframe mounted forever so carousel rotation does not remount it.
  const [loaded, setLoaded] = useState(active);
  useEffect(() => {
    if (active) setLoaded(true);
  }, [active]);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="home-creator-embed">
      {loaded ? (
        <iframe
          src={src}
          title={`Video: ${title}`}
          loading="eager"
          tabIndex={-1}
          aria-hidden="true"
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ width: 326, height: 700, transform: `scale(${width / 326})` }}
        />
      ) : null}
    </div>
  );
}

function CreatorVideo({ src, active, paused }: { src: string; active: boolean; paused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const shouldPlay = active && !paused;
  // Warm preload once; never flip-flop preload attrs (avoids media reload).
  const [warm, setWarm] = useState(active);
  useEffect(() => {
    if (active) setWarm(true);
  }, [active]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let inView = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      // pause() keeps currentTime; never assign currentTime or replace src here.
      if (
        !shouldPlay ||
        !inView ||
        document.hidden ||
        motion.matches ||
        document.documentElement.getAttribute("data-a11y-motion") === "reduce"
      ) {
        video.pause();
      } else {
        video.muted = true;
        void video.play().catch(() => {
          /* Browser power-saving may prevent autoplay. */
        });
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { threshold: 0.2 });
    observer.observe(video);
    const accessibility = new MutationObserver(sync);
    accessibility.observe(document.documentElement, { attributes: true, attributeFilter: ["data-a11y-motion"] });
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    video.addEventListener("canplay", sync);
    return () => {
      observer.disconnect();
      accessibility.disconnect();
      video.pause();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      video.removeEventListener("canplay", sync);
    };
  }, [shouldPlay]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload={warm ? "auto" : "metadata"}
      aria-hidden="true"
    />
  );
}
