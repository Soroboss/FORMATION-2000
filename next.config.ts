import type { NextConfig } from "next";
import path from "node:path";
import { securityHeaders } from "./lib/security/headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "**.insforge.app" },
    ],
  },
  async headers() {
    const headers = securityHeaders({
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      insforgeUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
    });
    return [
      {
        source: "/:path*",
        headers,
      },
    ];
  },
};

export default nextConfig;
