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
  enterAt: number;
  assembleAt: number;
};

const OFF_SCREEN_VW = 118;

const LAYERS: BurgerLayer[] = [
  {
    id: "bunTop",
    alt: "לחמנייה עליונה",
    from: "right",
    enterAt: 0.08,
    assembleAt: 0.38
  },
  {
    id: "sauce",
    alt: "רוטב",
    from: "left",
    enterAt: 0.18,
    assembleAt: 0.48
  },
  {
    id: "lettuce",
    alt: "חסה",
    from: "right",
    enterAt: 0.28,
    assembleAt: 0.58
  },
  {
    id: "tomato",
    alt: "עגבנייה",
    from: "left",
    enterAt: 0.38,
    assembleAt: 0.68
  },
  {
    id: "patty",
    alt: "קציצה",
    from: "right",
    enterAt: 0.48,
    assembleAt: 0.78
  },
  {
    id: "bunBottom",
    alt: "לחמנייה תחתונה",
    from: "left",
    enterAt: 0.58,
    assembleAt: 0.9
  }
];

type AssemblyLayerProps = {
  layer: BurgerLayer;
  src: string;
  progress: MotionValue<number>;
  reduceMotion: boolean | null;
};

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function AssemblyLayer({ layer, src, progress, reduceMotion }: AssemblyLayerProps) {
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

export function BurgerAssemblySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start 0.9", "center 0.44"]
  });

  return (
    <section
      ref={sectionRef}
      id="burger-assembly"
      className="burger-assembly"
      aria-label="הרכבת המבורגר"
    >
      <div ref={stageRef} className="burger-assembly__stage">
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
    </section>
  );
}
