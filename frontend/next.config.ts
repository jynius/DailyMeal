import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 워크스페이스 루트 설정 (lockfile 경고 해결)
  outputFileTracingRoot: __dirname,
  
  // 실험적 기능 설정
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
  // Hybrid 렌더링: 페이지별로 다른 렌더링 방식 사용
  // output: 'export' 제거 - 페이지별 설정 사용
};

export default nextConfig;
