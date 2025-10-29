// 애플리케이션 상수 정의

export const APP_CONFIG = {
  // API Base URL (환경별)
  API_BASE_URL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000/api' 
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'),
  
  // API Server URL (prefix 없음 - 이미지, 공개 API 등에 사용)
  API_SERVER_URL: process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : (process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'),
  
  API_TIMEOUT: 10000, // 10초
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_PHOTOS_PER_MEAL: 5,
  DEMO_USER: {
    email: 'demo@dailymeal.com',
    password: 'demo123',
    name: '데모 사용자'
  }
} as const

export const ROUTES = {
  HOME: '/',
  ADD: '/add',
  FEED: '/feed',
  PROFILE: '/profile',
  RESTAURANT: '/restaurant',
  MEAL: (id: string) => `/meal/${id}`
} as const

export const RATING_OPTIONS = [
  { value: 1, label: '😞', description: '별로예요' },
  { value: 2, label: '😐', description: '그저 그래요' },
  { value: 3, label: '🙂', description: '괜찮아요' },
  { value: 4, label: '😊', description: '좋아요' },
  { value: 5, label: '🤩', description: '최고예요' },
] as const