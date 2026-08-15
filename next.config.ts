import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * CSP tuned for Next.js App Router + Firebase + existing base44 image hosts + GA4.
 * 'unsafe-inline' / 'unsafe-eval' are required for Next runtime + JSON-LD until nonces are wired.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://media.base44.com https:",
  "media-src 'self' blob:",
  "frame-src 'self' https://www.instagram.com",
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
    "wss://*.googleapis.com",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com"
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
  experimental: {
    // Default is 1MB — large menu photos were rejected before the action ran (digest errors).
    serverActions: {
      bodySizeLimit: "10mb"
    },
    // Known Turbopack dev memory leak in 16.2.x — grows until OOM crash (vercel/next.js#91396).
    turbopackServerFastRefresh: false,
    // Persistent dev cache churns endlessly (worse on OneDrive) and leaks (vercel/next.js#81161).
    turbopackFileSystemCacheForDev: false
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.base44.com",
        pathname: "/images/**"
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
        pathname: "/**"
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
        },
        {
          source: "/images/gallery/:file",
          destination: "/api/media/gallery/:file"
        }
      ]
    };
  },
  async redirects() {
    return [
      {
        source: "/branches",
        destination: "/locations",
        permanent: true
      },
      {
        source: "/menu/category/:slug",
        destination: "/menu/:slug",
        permanent: true
      }
    ];
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
