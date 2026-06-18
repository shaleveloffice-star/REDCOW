"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue
} from "framer-motion";

import { BURGER_ASSEMBLY_IMAGES } from "@/data/site-images.registry";

type Side = "left" | "right";

type BurgerLayer = {
  id: keyof typeof BURGER_ASSEMBLY_IMAGES;
  alt: string;
  from: Side;
  enterAt: number;
  assembleAt: number;
};

const OFF_SCREEN_VW = 118;
const SCROLL_DAMP = 0.58;

function isInScrollDampZone(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  return rect.top < viewportHeight * 0.78 && rect.bottom > viewportHeight * 0.22;
}

function useBurgerAssemblyScrollDampening(
  sectionRef: RefObject<HTMLElement | null>,
  reduceMotion: boolean | null
) {
  useEffect(() => {
    if (reduceMotion) return;

    let touchStartY = 0;

    const onWheel = (event: WheelEvent) => {
      const section = sectionRef.current;
      if (!section || !isInScrollDampZone(section)) return;
      event.preventDefault();
      window.scrollBy({ top: event.deltaY * SCROLL_DAMP, behavior: "auto" });
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      const section = sectionRef.current;
      if (!section || event.touches.length !== 1 || !isInScrollDampZone(section)) return;

      const touchY = event.touches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - touchY;
      touchStartY = touchY;
      if (delta === 0) return;

      event.preventDefault();
      window.scrollBy({ top: delta * SCROLL_DAMP, behavior: "auto" });
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [reduceMotion, sectionRef]);
}

const LAYERS: BurgerLayer[] = [
  {
    id: "bunTop",
    alt: "לחמנייה עליונה",
    from: "right",
    enterAt: 0.32,
    assembleAt: 0.52
  },
  {
    id: "sauce",
    alt: "רוטב",
    from: "left",
    enterAt: 0.38,
    assembleAt: 0.6
  },
  {
    id: "lettuce",
    alt: "חסה",
    from: "right",
    enterAt: 0.44,
    assembleAt: 0.67
  },
  {
    id: "tomato",
    alt: "עגבנייה",
    from: "left",
    enterAt: 0.5,
    assembleAt: 0.74
  },
  {
    id: "patty",
    alt: "קציצה",
    from: "right",
    enterAt: 0.56,
    assembleAt: 0.81
  },
  {
    id: "bunBottom",
    alt: "לחמנייה תחתונה",
    from: "left",
    enterAt: 0.62,
    assembleAt: 0.99
  }
];

type AssemblyLayerProps = {
  layer: BurgerLayer;
  src: string;
  progress: MotionValue<number>;
  reduceMotion: boolean | null;
};

function easeOutQuint(value: number) {
  return 1 - Math.pow(1 - value, 5);
}

function AssemblyLayer({ layer, src, progress, reduceMotion }: AssemblyLayerProps) {
  const direction = layer.from === "right" ? 1 : -1;

  const x = useTransform(progress, (value) => {
    if (reduceMotion) return 0;
    if (value <= layer.enterAt) return `${direction * OFF_SCREEN_VW}vw`;
    if (value >= layer.assembleAt) return "0vw";
    const t = easeOutQuint((value - layer.enterAt) / (layer.assembleAt - layer.enterAt));
    return `${direction * OFF_SCREEN_VW * (1 - t)}vw`;
  });

  const opacity = useTransform(progress, (value) => {
    if (reduceMotion) return 1;
    if (value <= layer.enterAt) return 0;
    if (value >= layer.enterAt + 0.08) return 1;
    return (value - layer.enterAt) / 0.08;
  });

  const scale = useTransform(progress, (value) => {
    if (reduceMotion) return 1;
    if (value <= layer.enterAt) return 0.94;
    if (value >= layer.assembleAt) return 1;
    const t = (value - layer.enterAt) / (layer.assembleAt - layer.enterAt);
    return 0.94 + t * 0.06;
  });

  return (
    <motion.div
      className={`burger-assembly__layer burger-assembly__layer--${layer.id}`}
      style={{
        x,
        opacity,
        scale
      }}
    >
      <img src={src} alt={layer.alt} className="burger-assembly__layer-image" draggable={false} />
    </motion.div>
  );
}

type BurgerAssemblyStageProps = {
  dampeningRootRef?: RefObject<HTMLElement | null>;
};

export function BurgerAssemblyStage({ dampeningRootRef }: BurgerAssemblyStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useBurgerAssemblyScrollDampening(dampeningRootRef ?? stageRef, reduceMotion);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start end", "center center"]
  });

  return (
    <div ref={stageRef} className="burger-assembly__stage" aria-label="הרכבת המבורגר">
      {LAYERS.map((layer) => (
        <AssemblyLayer
          key={layer.id}
          layer={layer}
          src={BURGER_ASSEMBLY_IMAGES[layer.id]}
          progress={scrollYProgress}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}
