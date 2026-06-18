"use client";

import { useRef } from "react";
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
  stackOffset: number;
  enterAt: number;
  assembleAt: number;
};

const OFF_SCREEN_VW = 118;

const LAYERS: BurgerLayer[] = [
  {
    id: "bunTop",
    alt: "לחמנייה עליונה",
    from: "right",
    stackOffset: 0,
    enterAt: 0.05,
    assembleAt: 0.42
  },
  {
    id: "sauce",
    alt: "רוטב",
    from: "left",
    stackOffset: 52,
    enterAt: 0.12,
    assembleAt: 0.46
  },
  {
    id: "lettuce",
    alt: "חסה",
    from: "right",
    stackOffset: 104,
    enterAt: 0.19,
    assembleAt: 0.5
  },
  {
    id: "tomato",
    alt: "עגבנייה",
    from: "left",
    stackOffset: 156,
    enterAt: 0.26,
    assembleAt: 0.54
  },
  {
    id: "patty",
    alt: "קציצה",
    from: "right",
    stackOffset: 208,
    enterAt: 0.33,
    assembleAt: 0.58
  },
  {
    id: "bunBottom",
    alt: "לחמנייה תחתונה",
    from: "left",
    stackOffset: 272,
    enterAt: 0.4,
    assembleAt: 0.62
  }
];

type AssemblyLayerProps = {
  layer: BurgerLayer;
  src: string;
  zIndex: number;
  progress: MotionValue<number>;
  reduceMotion: boolean | null;
};

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function AssemblyLayer({ layer, src, zIndex, progress, reduceMotion }: AssemblyLayerProps) {
  const direction = layer.from === "right" ? 1 : -1;

  const x = useTransform(progress, (value) => {
    if (reduceMotion) return 0;
    if (value <= layer.enterAt) return `${direction * OFF_SCREEN_VW}vw`;
    if (value >= layer.assembleAt) return "0vw";
    const t = easeOutCubic((value - layer.enterAt) / (layer.assembleAt - layer.enterAt));
    return `${direction * OFF_SCREEN_VW * (1 - t)}vw`;
  });

  const opacity = useTransform(progress, (value) => {
    if (reduceMotion) return 1;
    if (value < layer.enterAt) return 0;
    if (value >= layer.enterAt + 0.04) return 1;
    return (value - layer.enterAt) / 0.04;
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
      className="burger-assembly__layer"
      style={{
        x,
        opacity,
        scale,
        top: layer.stackOffset,
        zIndex
      }}
    >
      <img src={src} alt={layer.alt} className="burger-assembly__layer-image" draggable={false} />
    </motion.div>
  );
}

export function BurgerAssemblySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  return (
    <section
      ref={sectionRef}
      id="burger-assembly"
      className="burger-assembly"
      aria-label="הרכבת המבורגר"
    >
      <div className="burger-assembly__sticky">
        <div className="burger-assembly__stage">
          {LAYERS.map((layer, index) => (
            <AssemblyLayer
              key={layer.id}
              layer={layer}
              src={BURGER_ASSEMBLY_IMAGES[layer.id]}
              zIndex={LAYERS.length - index}
              progress={scrollYProgress}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
