import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Prevent host-side image optimizer issues on some deployments.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ufs.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.ufs.sh",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
