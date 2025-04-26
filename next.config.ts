import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
  images: {
    domains: ['avatars.githubusercontent.com'], // <-- 여기에 추가
  },
};

export default nextConfig;
