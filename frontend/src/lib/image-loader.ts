/**
 * Custom Image Loader for Next.js
 * 
 * 개발 환경: 백엔드가 http://localhost:8000/uploads/... 형태로 반환
 * 프로덕션: 백엔드가 /api/uploads/... 형태로 반환
 * 
 * 이 로더는 모든 경로를 그대로 반환하여 Next.js가 최적화하지 않도록 함
 */

export default function imageLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // 모든 경로를 그대로 반환 (unoptimized: true 설정과 함께 사용)
  return src;
}
