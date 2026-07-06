import type { NextConfig } from "next";

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      { source: "/hub/:path*", destination: "/admin", permanent: false },
      { source: "/manage/:path*", destination: "/admin", permanent: false },
      { source: "/account/:path*", destination: "/admin", permanent: false },
      { source: "/feedback", destination: "/contact", permanent: false },
      { source: "/help", destination: "/contact", permanent: false },
      { source: "/signup", destination: "/signin", permanent: false },
      { source: "/forgot-password", destination: "/signin", permanent: false },
      { source: "/terms", destination: "/about", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
