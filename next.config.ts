import type { NextConfig } from "next";

/** Existing site security headers. Live Guide adds a worker-specific CSP below. */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()" },
];
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {remotePatterns:[{protocol:"https",hostname:"images.unsplash.com"}]},
  async headers() {
    return [
      {source:"/:path*",headers:securityHeaders},
      {source:"/go/:path*",headers:[{key:"Referrer-Policy",value:"no-referrer"}]},
      // Applied to the worker response, NOT the quiz page. No external origins or
      // eval-JS allowed; WebAssembly execution is required for face localization.
      {source:"/drape-tools/guide-worker.js",headers:[
        {key:"Content-Security-Policy",value:"default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'; worker-src 'none'; frame-ancestors 'none'"},
        {key:"Referrer-Policy",value:"no-referrer"},
        {key:"Cache-Control",value:"no-cache"}
      ]},
      {source:"/drape-tools/vendor/:path*",headers:[{key:"Referrer-Policy",value:"no-referrer"}]}
    ];
  },
};
export default nextConfig;
