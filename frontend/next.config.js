import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Next.js to treat the `frontend` folder as the workspace root for
  // output tracing. This avoids warnings when multiple lockfiles exist
  // (monorepo / workspace layouts) and ensures `next start` looks for
  // the `.next` build inside the frontend folder.
  outputFileTracingRoot: path.resolve(__dirname),

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
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
        protocol: 'http',
        hostname: 'www.dailymeal.life',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.dailymeal.life',
        pathname: '/uploads/**',
      }
    ],
  },
};

export default nextConfig;
