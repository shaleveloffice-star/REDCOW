import Link from "next/link";

export const SITE_LOGO_SRC = "/images/brand/nb-burger-logo.png";

type SiteLogoProps = {
  variant?: "header" | "footer";
  className?: string;
};

export function SiteLogo({ variant = "header", className }: SiteLogoProps) {
  const classes = ["site-logo", `site-logo--${variant}`, className].filter(Boolean).join(" ");

  return (
    <Link href="/" className={classes} aria-label="NB Burger — דף הבית">
      <img className="site-logo-img" src={SITE_LOGO_SRC} alt="" width={280} height={140} />
    </Link>
  );
}
