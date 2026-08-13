type ResponsiveSiteImageProps = {
  desktopSrc: string;
  mobileSrc?: string;
  alt: string;
  className?: string;
  pictureClassName?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  decoding?: "async" | "auto" | "sync";
  draggable?: boolean;
};

const MOBILE_MEDIA = "(max-width: 767px)";

export function ResponsiveSiteImage({
  desktopSrc,
  mobileSrc,
  alt,
  className,
  pictureClassName,
  width,
  height,
  loading,
  fetchPriority,
  decoding = "async",
  draggable = false
}: ResponsiveSiteImageProps) {
  const desktop = desktopSrc.trim();
  const mobile = (mobileSrc ?? desktop).trim() || desktop;

  if (!desktop && !mobile) {
    return null;
  }

  const img = (
    <img
      src={desktop || mobile}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={decoding}
      draggable={draggable}
    />
  );

  if (!mobile || mobile === desktop) {
    return img;
  }

  return (
    <picture className={pictureClassName}>
      <source media={MOBILE_MEDIA} srcSet={mobile} />
      {img}
    </picture>
  );
}
