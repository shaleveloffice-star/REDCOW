"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue
} from "framer-motion";

import { BURGER_ASSEMBLY_IMAGES } from "@/data/site-images.registry";
import { useLocale } from "@/components/providers/locale-provider";
import { useEffectiveReducedMotion } from "@/lib/a11y/use-effective-reduced-motion";
import { resolveImageAlt, type BurgerLayerId } from "@/lib/image-alt";

type Side = "left" | "right";

type BurgerLayer = {
  id: keyof typeof BURGER_ASSEMBLY_IMAGES;
  from: Side;
  enterAt: number;
  assembleAt: number;
};

const OFF_SCREEN_VW = 118;

const LAYERS: BurgerLayer[] = [
  {
    id: "bunTop",
    from: "right",
    enterAt: 0.32,
    assembleAt: 0.52
  },
  {
    id: "sauce",
    from: "left",
    enterAt: 0.38,
    assembleAt: 0.6
  },
  {
    id: "lettuce",
    from: "right",
    enterAt: 0.44,
    assembleAt: 0.67
  },
  {
    id: "tomato",
    from: "left",
    enterAt: 0.5,
    assembleAt: 0.74
  },
  {
    id: "patty",
    from: "right",
    enterAt: 0.56,
    assembleAt: 0.81
  },
  {
    id: "bunBottom",
    from: "left",
    enterAt: 0.62,
    assembleAt: 0.99
  }
];

type AssemblyLayerProps = {
  layer: BurgerLayer;
  src: string;
  alt: string;
  progress: MotionValue<number>;
  reduceMotion: boolean | null;
};

function easeOutQuint(value: number) {
  return 1 - Math.pow(1 - value, 5);
}

function AssemblyLayer({ layer, src, alt, progress, reduceMotion }: AssemblyLayerProps) {
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
        alt={alt}
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
  const reduceMotion = useEffectiveReducedMotion();
  const { locale } = useLocale();

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
          alt={resolveImageAlt({
            kind: "burger-layer",
            locale,
            layerId: layer.id as BurgerLayerId
          })}
          progress={scrollYProgress}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}
