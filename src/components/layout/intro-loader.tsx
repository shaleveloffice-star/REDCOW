"use client";

import { usePathname, useServerInsertedHTML } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const INTRO_TEXT = "SO WHAT?";

/** Hard cap measured from navigation start - the overlay never stays longer than this. */
const INTRO_SAFETY_TIMEOUT_MS = 3000;
/** Pause after the last letter lands, before fading out. */
const INTRO_HOLD_MS = 220;
const INTRO_HOLD_REDUCED_MS = 250;
/** Must match `.sw-intro.is-leaving` transition duration. */
const INTRO_FADE_MS = 450;
const INTRO_FADE_REDUCED_MS = 200;
/** Letters start once the brand font is ready, or after this cap (see boot script). */
const INTRO_FONT_WAIT_MS = 600;

const GO_CLASS = "sw-intro-go";
/** Set before first paint when the visitor came from another page of the site (navbar links are full loads). */
const SKIP_CLASS = "sw-intro-skip";

function buildBootScript(fontFamily: string): string {
  const family = JSON.stringify(`400 1em ${fontFamily}`).replace(/</g, "\\u003c");
  return `(function(){var d=document.documentElement,done=false;try{var r=document.referrer;if(r&&new URL(r).origin===location.origin){d.classList.add("${SKIP_CLASS}");return;}}catch(e){}function go(){if(done)return;done=true;d.classList.add("${GO_CLASS}");}setTimeout(go,${INTRO_FONT_WAIT_MS});try{document.fonts.load(${family}).then(go,go);}catch(e){go();}})();`;
}

const NOSCRIPT_CSS = ".sw-intro{display:none!important}";

function cameFromSameSite(): boolean {
  try {
    return Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, ms)));
}

function viewportImagesReady(): Promise<void> {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pending = Array.from(document.images).filter((img) => {
    // Lazy images inside clipped tracks (marquees) may never load - only priority images gate the reveal.
    if (img.complete || img.loading === "lazy") return false;
    const rect = img.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < vh && rect.right > 0 && rect.left < vw;
  });
  return Promise.all(
    pending.map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        })
    )
  ).then(() => undefined);
}

function lettersFinished(lastLetter: HTMLElement | null): Promise<void> {
  if (!lastLetter || typeof lastLetter.getAnimations !== "function") return Promise.resolve();
  const animations = lastLetter.getAnimations();
  if (animations.length === 0) return Promise.resolve();
  return Promise.all(animations.map((animation) => animation.finished)).then(
    () => undefined,
    () => undefined
  );
}

type Phase = "showing" | "leaving" | "done";

/**
 * First-visit brand intro. Purely a visual layer: the page underneath is fully server-rendered and
 * painted the whole time, so crawlers and LCP see the real content. Plays only when a public route
 * is entered from outside the site - client-side navigation never mounts it again, and full loads
 * coming from another page of the site skip it before first paint.
 */
export function IntroLoader({ fontFamily }: { fontFamily: string }) {
  const pathname = usePathname();
  const [enabled] = useState(() => !(pathname ?? "").startsWith("/admin"));
  const [phase, setPhase] = useState<Phase>("showing");
  const lastLetterRef = useRef<HTMLSpanElement>(null);
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (!enabled || inserted.current) return null;
    inserted.current = true;
    return (
      <>
        <script
          id="sw-intro-boot"
          // eslint-disable-next-line react/no-danger -- trusted inline boot only
          dangerouslySetInnerHTML={{ __html: buildBootScript(fontFamily) }}
        />
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
      </>
    );
  });

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    if (root.classList.contains(SKIP_CLASS) || cameFromSameSite()) {
      setPhase("done");
      return;
    }
    let cancelled = false;

    // React may re-create <html> attributes (e.g. client-rendered 404), dropping the boot script's class.
    if (!root.classList.contains(GO_CLASS)) {
      const fontLoad = document.fonts?.load(`400 1em ${fontFamily}`).then(() => undefined, () => undefined) ?? Promise.resolve();
      void Promise.race([fontLoad, delay(INTRO_FONT_WAIT_MS - performance.now())]).then(() => {
        if (!cancelled) root.classList.add(GO_CLASS);
      });
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reducedMotion ? INTRO_HOLD_REDUCED_MS : INTRO_HOLD_MS;

    const animationDone = reducedMotion
      ? delay(hold)
      : lettersFinished(lastLetterRef.current).then(() => delay(hold));
    const fontsReady = document.fonts?.ready.then(() => undefined, () => undefined) ?? Promise.resolve();
    const contentReady = Promise.all([fontsReady, viewportImagesReady()]);
    const safety = delay(INTRO_SAFETY_TIMEOUT_MS - performance.now());

    void Promise.race([Promise.all([animationDone, contentReady]), safety]).then(() => {
      if (cancelled) return;
      setPhase("leaving");
      window.setTimeout(() => {
        if (!cancelled) setPhase("done");
      }, reducedMotion ? INTRO_FADE_REDUCED_MS : INTRO_FADE_MS);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, fontFamily]);

  if (!enabled || phase === "done") return null;

  const letters = Array.from(INTRO_TEXT);
  return (
    <div className={`sw-intro${phase === "leaving" ? " is-leaving" : ""}`} aria-hidden="true">
      <span className="sw-intro-word" dir="ltr">
        {letters.map((char, index) => (
          <span
            key={index}
            ref={index === letters.length - 1 ? lastLetterRef : undefined}
            className={char === " " ? "sw-intro-letter sw-intro-letter--space" : "sw-intro-letter"}
            style={{ "--sw-i": index } as React.CSSProperties}
          >
            {char === " " ? "\u00a0" : char}
          </span>
        ))}
      </span>
    </div>
  );
}
