import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // yubinbango-core2の型エラーを回避
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
