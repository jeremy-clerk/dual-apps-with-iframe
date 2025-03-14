import { NextConfig } from "next";

// Set the CSP for iframes
// This is to prevent someone else from iframing your app on an origin besides your own trusted origins
const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    const trustedOrigins = process.env.TRUSTED_IFRAME_ORIGINS
      ? process.env.TRUSTED_IFRAME_ORIGINS.split(",")
      : ["http://localhost:3000"];
    const frameAncestors = ["'self'", ...trustedOrigins].join(" ");
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
