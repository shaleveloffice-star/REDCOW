"use client";

import { useEffect, useRef, useState } from "react";

import { formatBytesShort, type AdminImageSpec } from "@/data/admin-image-specs";
import { checkImageAgainstSpec, classifyImageFit } from "@/lib/admin/image-fit";

type ImageFacts = { width: number; height: number; bytes: number | null };

const factsCache = new Map<string, Promise<ImageFacts | null>>();

function measureDimensions(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

async function measureBytes(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { method: "HEAD", cache: "force-cache" });
    const length = Number(response.headers.get("content-length"));
    return response.ok && length > 0 ? length : null;
  } catch {
    return null;
  }
}

function loadImageFacts(url: string): Promise<ImageFacts | null> {
  const cached = factsCache.get(url);
  if (cached) return cached;
  const pending = Promise.all([measureDimensions(url), measureBytes(url)]).then(([dimensions, bytes]) =>
    dimensions ? { ...dimensions, bytes } : null
  );
  factsCache.set(url, pending);
  return pending;
}

export function AdminImageFacts({ url, spec }: { url: string; spec?: AdminImageSpec }) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<{ url: string; facts: ImageFacts | null } | null>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || !url.trim()) return;
    let cancelled = false;
    void loadImageFacts(url).then((facts) => {
      if (!cancelled) setState({ url, facts });
    });
    return () => {
      cancelled = true;
    };
  }, [url, visible]);

  const facts = state?.url === url ? state.facts : undefined;

  if (facts === undefined) {
    return (
      <span ref={rootRef} className="admin-image-facts admin-image-facts--loading">
        <span className="admin-image-facts-size">בודק גודל…</span>
      </span>
    );
  }

  if (facts === null) {
    return (
      <span ref={rootRef} className="admin-image-facts">
        <span className="admin-image-facts-size">לא ניתן למדוד את התמונה</span>
      </span>
    );
  }

  const fit = classifyImageFit(facts.width, facts.height);
  const fieldCheck = spec ? checkImageAgainstSpec(facts.width, facts.height, facts.bytes, spec) : null;

  return (
    <span ref={rootRef} className="admin-image-facts">
      <span className="admin-image-facts-size">
        גודל בפועל: <bdi dir="ltr">{`${facts.width}×${facts.height}px`}</bdi>
        {facts.bytes !== null ? (
          <>
            {" · "}
            <bdi dir="ltr">{formatBytesShort(facts.bytes)}</bdi>
          </>
        ) : null}
      </span>
      {fit ? (
        <>
          <span className={`admin-image-facts-badge admin-image-facts-badge--${fit.kind}`}>מומלץ: {fit.label}</span>
          <span className="admin-image-facts-reason">{fit.reason}</span>
        </>
      ) : null}
      {fieldCheck ? (
        fieldCheck.ok ? (
          <span className="admin-image-facts-check admin-image-facts-check--ok">✓ מתאים לשדה הזה</span>
        ) : (
          fieldCheck.messages.map((message) => (
            <span key={message} className="admin-image-facts-check admin-image-facts-check--warn">
              ⚠ {message}
            </span>
          ))
        )
      ) : null}
    </span>
  );
}
