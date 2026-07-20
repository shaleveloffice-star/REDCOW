import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * CSP tuned for Next.js App Router + Firebase + existing base44 image hosts.
 * 'unsafe-inline' / 'unsafe-eval' are required for Next runtime + JSON-LD until nonces are wired.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://media.base44.com https:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://*.googleapis.com",
    "https://*.firebaseio.com",
    "https://*.cloudfunctions.net",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://firestore.googleapis.com",
    "wss://*.firebaseio.com",
    "wss://*.googleapis.com"
  ].join(" "),
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload"
        }
      ]
    : [])
];

/** Fixed public filenames (no content-hash) — short cache + SWR, not year-long immutable. */
const publicAssetCache = "public, max-age=86400, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Externalize firebase-admin; load only via firebase-admin.cjs (CJS require condition).
  // ESM import()/bundling caused ERR_REQUIRE_ESM and slow cold starts on Vercel.
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.base44.com",
        pathname: "/images/**"
      }
    ]
  },
  /**
   * When OneDrive marks public/images/menu ReadOnly, uploads land in data/local/uploads/menu.
   * Fallback rewrite serves those files under the same `/images/menu/*` URL.
   */
  async rewrites() {
    return {
      fallback: [
        {
          source: "/images/menu/:file",
          destination: "/api/media/menu/:file"
        }
      ]
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: publicAssetCache }]
      },
      {
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: publicAssetCache }]
      },
      {
        source: "/burger/:path*",
        headers: [{ key: "Cache-Control", value: publicAssetCache }]
      }
    ];
  }
};

export default nextConfig;
