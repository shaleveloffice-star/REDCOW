"use client";

type Sparkle = {
  x: string;
  y: string;
  delay: string;
  duration: string;
  size: "xs" | "sm";
  opacity: number;
};

/** Deterministic PRNG so SSR and client match. */
function createRng(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function buildHomeSparkles(count: number): Sparkle[] {
  const rng = createRng(20260910);
  const sparkles: Sparkle[] = [];

  for (let index = 0; index < count; index += 1) {
    const size: Sparkle["size"] = rng() > 0.62 ? "sm" : "xs";
    sparkles.push({
      x: `${(rng() * 98 + 1).toFixed(2)}%`,
      y: `${(rng() * 98 + 1).toFixed(2)}%`,
      delay: `${(rng() * 3.8).toFixed(2)}s`,
      duration: `${(2.1 + rng() * 2.4).toFixed(2)}s`,
      size,
      opacity: Number((0.45 + rng() * 0.55).toFixed(2))
    });
  }

  return sparkles;
}

const HOME_SPARKLES = buildHomeSparkles(280);

export function HomePageGlitter() {
  return (
    <div className="home-page-glitter" aria-hidden="true">
      {HOME_SPARKLES.map((sparkle, index) => (
        <span
          key={index}
          className={`language-switcher-sparkle is-${sparkle.size}`}
          style={{
            left: sparkle.x,
            top: sparkle.y,
            animationDelay: sparkle.delay,
            animationDuration: sparkle.duration,
            ["--sparkle-opacity" as string]: String(sparkle.opacity)
          }}
        />
      ))}
    </div>
  );
}
