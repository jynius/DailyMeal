import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Monorepo support: Trace output files correctly from workspace root
  outputFileTracingRoot: path.resolve(__dirname, '../'),

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Disable SWC minification for debugging stability
  // swcMinify: false, // Deprecated in Next.js 15 (always on)

  images: {
    unoptimized: true, // Disable optimization for consistent local asset loading
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '172.21.114.94',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.dailymeal.life',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'dailymeal.life',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.dailymeal.life',
        pathname: '/uploads/**',
      }
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;
