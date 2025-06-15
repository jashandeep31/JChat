import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    position: "bottom-right", // or 'bottom-left', 'top-right', 'top-left'
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "job2tech-public.s3.us-east-1.amazonaws.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
