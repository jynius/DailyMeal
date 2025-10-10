/** @type {import('next').NextConfig} */
const nextConfig = {
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
