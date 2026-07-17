import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  }
];

/** Fixed public filenames (no content-hash) — short cache + SWR, not year-long immutable. */
const publicAssetCache = "public, max-age=86400, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["firebase-admin"],
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
