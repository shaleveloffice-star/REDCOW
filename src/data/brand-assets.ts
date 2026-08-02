export const BRAND_ASSET_VERSION = "7";

const withVersion = (path: string) => `${path}?v=${BRAND_ASSET_VERSION}`;

/** Stable URL for Schema.org / Google (no cache-bust query). */
export const SITE_LOGO_SCHEMA_SRC = "/images/brand/nb-burger-logo.png";

/** Square logo — footer, favicons, structured data previews. */
export const SITE_LOGO_SRC = withVersion(SITE_LOGO_SCHEMA_SRC);

/** Black wordmark on transparent — white / scrolled header. */
export const SITE_WORDMARK_DARK_SRC = withVersion("/images/brand/nb-burger-wordmark-dark.png");
export const SITE_WORDMARK_DARK_WEBP_SRC = withVersion("/images/brand/nb-burger-wordmark-dark.webp");

/** White wordmark on transparent — black header & dark footer. */
export const SITE_WORDMARK_LIGHT_SRC = withVersion("/images/brand/nb-burger-wordmark-light.png");
export const SITE_WORDMARK_LIGHT_WEBP_SRC = withVersion("/images/brand/nb-burger-wordmark-light.webp");

/** @deprecated Use SITE_WORDMARK_DARK_* — kept for legacy imports. */
export const SITE_WORDMARK_SRC = SITE_WORDMARK_DARK_SRC;
/** @deprecated Use SITE_WORDMARK_DARK_* — kept for legacy imports. */
export const SITE_WORDMARK_WEBP_SRC = SITE_WORDMARK_DARK_WEBP_SRC;
