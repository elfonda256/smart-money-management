import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is required for Docker/Coolify, but Vercel manages serverless output natively
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
