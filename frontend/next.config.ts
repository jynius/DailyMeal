import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 실험적 기능 모두 제거
  swcMinify: false, // SWC 비활성화
  images: {
    unoptimized: true, // 이미지 최적화 비활성화
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
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
        protocol: 'https',
        hostname: 'www.dailymeal.life',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'dailymeal.life',
        pathname: '/api/uploads/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // 빌드 시 ESLint 무시
  },
  typescript: {
    ignoreBuildErrors: true, // TypeScript 에러 무시
  },
  // 프로덕션 빌드에서 console.* 자동 제거
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // error와 warn은 유지
    } : false,
  },
};

export default nextConfig;
