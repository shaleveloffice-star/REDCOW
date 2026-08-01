"use client";

import Image from "next/image";
import { DECORATIVE_IMAGE_ALT } from "@/lib/image-alt";
import { isVideoMediaUrl } from "@/lib/menu-media";

type MenuItemImageProps = {
  src: string;
  alt: string;
  /** When true, image is hidden from AT (redundant with adjacent link text). */
  decorative?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  loading?: "lazy" | "eager";
};

function shouldUsePlainImg(src: string) {
  return (
    src.startsWith("data:image/") ||
    src.startsWith("blob:") ||
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/api/")
  );
}

const FALLBACK_IMAGE = "/images/menu/nb-menu-burger.png";

/** Renders menu media; supports admin uploads (/api/media), data-URLs, and static paths. */
export function MenuItemImage({
  src,
  alt,
  decorative = false,
  width = 480,
  height = 480,
  sizes,
  className,
  loading = "lazy"
}: MenuItemImageProps) {
  const media = src.trim() || FALLBACK_IMAGE;
  const resolvedAlt = decorative ? DECORATIVE_IMAGE_ALT : alt;

  if (isVideoMediaUrl(media)) {
    return null;
  }

  // next/image optimizer is unreliable for data URLs and dynamic API media routes
  if (shouldUsePlainImg(media)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={media}
        alt={resolvedAlt}
        aria-hidden={decorative ? true : undefined}
        width={width}
        height={height}
        loading={loading}
        className={className}
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={media}
      alt={resolvedAlt}
      aria-hidden={decorative ? true : undefined}
      width={width}
      height={height}
      sizes={sizes}
      loading={loading}
      className={className}
    />
  );
}
