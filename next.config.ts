import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TODO: Remove - temp workaround for a CORS issue in the Public API
  async rewrites() {
    return [
      {
        source: "/api/coinlist/client/:path*",
        destination: "https://api.coinlist.co/:path*",
      },
    ];
  },
};

export default nextConfig;
