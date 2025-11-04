// 애플리케이션 상수 정의

/**
 * 필수 환경 변수 검증 헬퍼
 */
function getRequiredEnv(key: string, description: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Description: ${description}\n` +
        `Please check your .env.local (dev) or .env.production (prod) file.`,
    )
  }
  return value
}

export const APP_CONFIG = {
  // Server Root URL (정적 파일용)
  // 용도: 이미지/업로드 파일 접근 (예: /uploads/*)
  // 미래: CDN/S3로 분리 가능
  SERVER_URL: getRequiredEnv(
    'NEXT_PUBLIC_SERVER_URL',
    'Static file server URL (e.g., http://localhost:8000)',
  ),

  // REST API Base URL (API 엔드포인트용)
  // 용도: REST API 호출 (예: /api/*)
  // Global Prefix가 적용된 API 엔드포인트
  API_BASE_URL: getRequiredEnv(
    'NEXT_PUBLIC_API_URL',
    'REST API endpoint URL (e.g., http://localhost:8000/api)',
  ),

  // 로그 레벨 설정 (ERROR=0, WARN=1, INFO=2, DEBUG=3, TRACE=4)
  LOG_LEVEL: getRequiredEnv('NEXT_PUBLIC_LOG_LEVEL', 'Log level (ERROR, WARN, INFO, DEBUG, TRACE)'),

  // 모듈별 로그 레벨 설정
  // 예: { 'AuthService': 'TRACE', 'API': 'DEBUG', 'Socket': 'INFO' }
  MODULE_LOG_LEVELS: {
    APIMonitor: 'DEBUG', // API 성능 모니터링 (콘솔 로그 + 통계)
  } as Record<string, string>,

  API_TIMEOUT: 10000, // 10초
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_PHOTOS_PER_MEAL: 5,
  DEMO_USER: {
    email: 'demo@dailymeal.com',
    password: 'demo123',
    name: '데모 사용자',
  },
} as const

export const ROUTES = {
  HOME: '/',
  ADD: '/add',
  FEED: '/feed',
  PROFILE: '/profile',
  RESTAURANT: '/restaurant',
  MEAL: (id: string) => `/meal/${id}`,
} as const

export const RATING_OPTIONS = [
  { value: 1, label: '😞', description: '별로예요' },
  { value: 2, label: '😐', description: '그저 그래요' },
  { value: 3, label: '🙂', description: '괜찮아요' },
  { value: 4, label: '😊', description: '좋아요' },
  { value: 5, label: '🤩', description: '최고예요' },
] as const

/**
 * 이미지 URL 변환 헬퍼
 * Backend의 ConfigService.transformImageUrl()과 동일한 로직
 *
 * @param photo 이미지 경로 (null/undefined 허용)
 * @returns 변환된 URL 또는 빈 문자열
 */
export function transformImageUrl(photo: string | null | undefined): string {
  if (!photo) return ''

  // 이미 절대 URL인 경우
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo
  }

  // SERVER_URL이 있으면 절대 URL 반환
  if (APP_CONFIG.SERVER_URL) {
    return `${APP_CONFIG.SERVER_URL}${photo}`
  }

  // 없으면 상대 경로 그대로 반환
  return photo
}
