// 중앙 API 엔트리 포인트
// 외부 컴포넌트에서 사용할 API 모듈만 공개합니다.

// ============================================
// 공개 API - 컴포넌트/페이지에서 사용
// ============================================

// 인증 관련
export { tokenManager } from './token'
export { authApi } from './auth'

// 도메인 API
export * from './meals'
export * from './friends'
export * from './profile'
export * from './share'
export * from './restaurants'
export * from './locations'

// ============================================
// 내부 전용 모듈 (외부에서 직접 import 금지)
// ============================================
// ❌ apiRequest (./client) → API 모듈 내부에서만 사용
// ❌ apiMonitor (./monitor) → client.ts에서만 사용
//
// 필요한 경우 ./client 또는 ./monitor에서 직접 import하세요.
// 예: import { apiRequest } from '@/lib/api/client'
//     import { apiMonitor } from '@/lib/api/monitor'
