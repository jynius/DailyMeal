import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 실험적 기능 모두 제거
  swcMinify: false, // SWC 비활성화
  images: {
    unoptimized: true, // 이미지 최적화 비활성화
  },
  eslint: {
    ignoreDuringBuilds: true, // 빌드 시 ESLint 무시
  },
  typescript: {
    ignoreBuildErrors: true, // TypeScript 에러 무시
  },
};

export default nextConfig;
