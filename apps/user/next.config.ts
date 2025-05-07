import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  reactStrictMode: false,
};

export default nextConfig;
