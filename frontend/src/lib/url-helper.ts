// 이미지 URL 헬퍼 함수
// 개발 환경에서는 localhost:8000 사용, 프로덕션에서는 상대 경로 사용

export function getImageUrl(photoUrl: string | null | undefined): string {
  if (!photoUrl) return ''
  
  // 이미 전체 URL인 경우 그대로 반환
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl
  }
  
  // 개발 환경: localhost:8000 프리픽스
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:8000${photoUrl}`
  }
  
  // 프로덕션: 상대 경로 (Nginx가 /uploads를 프록시)
  return photoUrl
}

export function getApiUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000'
  }
  return process.env.NEXT_PUBLIC_API_URL || '/api'
}
