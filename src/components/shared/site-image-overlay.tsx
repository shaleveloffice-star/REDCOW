import { siteImageOverlayStyle, type SiteImageOverlay as Overlay } from "@/lib/site-image-overlay";

export function SiteImageOverlay({
  overlay,
  className
}: {
  overlay: Overlay | null | undefined;
  className?: string;
}) {
  if (!overlay) return null;
  return (
    <div
      aria-hidden="true"
      className={`site-image-overlay${className ? ` ${className}` : ""}`}
      style={siteImageOverlayStyle(overlay)}
    />
  );
}
