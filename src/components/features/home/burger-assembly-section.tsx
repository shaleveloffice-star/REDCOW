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
      <img
        src={src}
        alt={layer.alt}
        className="burger-assembly__layer-image"
        draggable={false}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
      />
    </motion.div>
  );
}

export function BurgerAssemblyStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

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
