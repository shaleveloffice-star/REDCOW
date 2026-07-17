"use client";

import dynamic from "next/dynamic";

const ShortTour = dynamic(
  () =>
    import("@/components/features/home/short-tour").then((mod) => ({
      default: mod.ShortTour
    })),
  { ssr: false, loading: () => null }
);

export function HomeShortTour() {
  return <ShortTour />;
}
