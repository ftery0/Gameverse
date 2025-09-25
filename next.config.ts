/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com', 
    ],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  reactStrictMode: false,
  experimental: {
    svgr: true,
  },
};

export default nextConfig;
