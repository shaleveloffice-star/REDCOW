import Link from "next/link";

type SiteBrandWordmarkProps = {
  className?: string;
};

export function SiteBrandWordmark({ className }: SiteBrandWordmarkProps) {
  const classes = ["site-brand-wordmark", className].filter(Boolean).join(" ");

  return (
    <Link href="/" className={classes} aria-label="NB BURGER — דף הבית">
      NB BURGER
    </Link>
  );
}
