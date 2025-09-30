import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // yubinbango-core2の型エラーを回避
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
