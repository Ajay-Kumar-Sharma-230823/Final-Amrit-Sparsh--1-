import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ['three'],
  allowedDevOrigins: ['192.168.29.150', '*.loca.lt'],
};

export default nextConfig;
