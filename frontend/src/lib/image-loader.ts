/**
 * Custom Image Loader for Next.js
 * /api/uploads 경로를 그대로 사용하도록 설정
 */

export default function imageLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // /api/uploads로 시작하는 경로는 그대로 반환 (백엔드 이미지)
  if (src.startsWith('/api/uploads') || src.startsWith('/uploads')) {
    return src;
  }
  
  // 외부 URL은 그대로 반환
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // 기타 경로는 그대로 반환
  return src;
}
