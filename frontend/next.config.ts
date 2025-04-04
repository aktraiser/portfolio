import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'dlthjkunkbehgpxhmgub.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      }
    ],
  }
};

export default nextConfig;
