import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        hostname: 'your-domain.com',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'your-domain.com',
        pathname: '/api/uploads/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // 개발 환경에서의 성능 최적화
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Hybrid 렌더링: 페이지별로 다른 렌더링 방식 사용
  // output: 'export' 제거 - 페이지별 설정 사용
};

export default nextConfig;
