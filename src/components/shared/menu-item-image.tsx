"use client";

import Image from "next/image";
import { isVideoMediaUrl } from "@/lib/menu-media";

type MenuItemImageProps = {
  src: string;
  alt: string;
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
  width = 480,
  height = 480,
  sizes,
  className,
  loading = "lazy"
}: MenuItemImageProps) {
  const media = src.trim() || FALLBACK_IMAGE;

  if (isVideoMediaUrl(media)) {
    return null;
  }

  // next/image optimizer is unreliable for data URLs and dynamic API media routes
  if (shouldUsePlainImg(media)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={media}
        alt={alt}
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
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      loading={loading}
      className={className}
    />
  );
}
