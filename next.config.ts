import type { NextConfig } from "next";

/**
 * Security headers. The app has no iframe embedding story and no third-party
 * script needs, so the strict answers are also the correct ones here.
 */
const securityHeaders = [
  // Clickjacking: nobody frames Palevie, including the affiliate redirect pages.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Don't leak the full result URL (which carries the person's tone) to retailers.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // The camera is used by the selfie scan on this origin only; nothing else is needed.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Affiliate hand-offs should not carry the referring URL at all.
      { source: "/go/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
    ];
  },
};

export default nextConfig;
