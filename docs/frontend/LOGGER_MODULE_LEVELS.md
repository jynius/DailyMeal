# Logger 모듈별 로그 레벨 설정 가이드

## 📋 개요

Java의 Log4j/Logback처럼 **모듈별로 다른 로그 레벨**을 설정할 수 있습니다.

## 🎯 사용 방법

### 1. 런타임 설정 (개발 중 디버깅)

```typescript
import { logger, LogLevel } from '@/lib/logger'

// 특정 모듈의 로그 레벨 설정
logger.setModuleLevel('AuthService', LogLevel.TRACE)
logger.setModuleLevel('API', LogLevel.DEBUG)
logger.setModuleLevel('Socket', LogLevel.INFO)

// 여러 모듈을 한번에 설정
logger.setModuleLevels({
  'AuthService': LogLevel.TRACE,
  'API': LogLevel.DEBUG,
  'Socket': LogLevel.INFO,
  'LocationContext': LogLevel.WARN,
})
```

### 2. 설정 파일 기반 (constants.ts)

```typescript
// frontend/src/lib/constants.ts

export const APP_CONFIG = {
  // ...
  MODULE_LOG_LEVELS: {
    'AuthService': 'TRACE',    // 인증 관련 모든 로그
    'API': 'DEBUG',             // API 요청/응답 디버그
    'Socket': 'INFO',           // Socket.IO 주요 이벤트만
    'LocationContext': 'WARN',  // 위치 서비스 경고만
  },
}
```

### 3. 브라우저 콘솔에서 동적 변경

```javascript
// 브라우저 개발자 도구 콘솔에서
logger.setModuleLevel('AuthService', 3) // LogLevel.DEBUG = 3
logger.setModuleLevel('API', 4)          // LogLevel.TRACE = 4
```

## 📊 로그 레벨

| 레벨 | 값 | 설명 | 용도 |
|------|---|------|------|
| `ERROR` | 0 | 에러만 | 프로덕션 중요 오류 |
| `WARN` | 1 | 경고 이상 | 프로덕션 경고 포함 |
| `INFO` | 2 | 정보 이상 | 주요 흐름 추적 |
| `DEBUG` | 3 | 디버그 이상 | 개발 중 상세 정보 |
| `TRACE` | 4 | 모든 로그 | 완전한 추적 |

## 🎨 실제 사용 예시

### 컴포넌트/서비스에서 사용

```typescript
// src/contexts/auth-context.tsx
import { logger } from '@/lib/logger'

export function AuthProvider({ children }: { children: ReactNode }) {
  const checkAuth = useCallback(() => {
    logger.debug('Checking auth...', 'AuthService')
    
    const token = tokenManager.get()
    logger.trace('Token retrieved', 'AuthService', { hasToken: !!token })
    
    if (!token) {
      logger.info('No token found', 'AuthService')
      return
    }
    
    try {
      const decoded = jwtDecode<JwtPayload>(token)
      logger.debug('Token decoded successfully', 'AuthService', { exp: decoded.exp })
    } catch (error) {
      logger.error('Token decode failed', error, 'AuthService')
    }
  }, [])
  
  // ...
}
```

### API 요청에서 사용

```typescript
// src/lib/api/client.ts
import { logger } from '@/lib/logger'

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  logger.debug(`API Request: ${method} ${endpoint}`, 'API')
  
  try {
    const response = await fetch(url, options)
    logger.info(`API Response: ${response.status}`, 'API')
    
    if (!response.ok) {
      logger.error(`API Error: ${response.status}`, null, 'API')
    }
    
    return data
  } catch (error) {
    logger.error('API Request failed', error, 'API')
    throw error
  }
}
```

## 🔧 디버깅 시나리오

### 시나리오 1: 인증 문제 디버깅

```typescript
// 전역 로그는 WARN, 인증 관련만 TRACE
logger.setLevel(LogLevel.WARN)
logger.setModuleLevel('AuthService', LogLevel.TRACE)
logger.setModuleLevel('API', LogLevel.DEBUG)

// 결과:
// ✅ AuthService: 모든 로그 출력
// ✅ API: DEBUG 이상 출력
// ⚠️ 기타 모듈: WARN 이상만 출력
```

### 시나리오 2: Socket.IO 연결 문제

```typescript
logger.setLevel(LogLevel.ERROR)
logger.setModuleLevel('Socket', LogLevel.TRACE)
logger.setModuleLevel('RealTimeContext', LogLevel.DEBUG)

// 결과:
// ✅ Socket 관련: 완전한 추적
// ✅ RealTime 관련: 디버그 정보
// ⚠️ 기타: 에러만
```

### 시나리오 3: 프로덕션 모드에서 특정 모듈만 디버깅

```typescript
// 프로덕션이지만 특정 사용자의 위치 문제 조사
logger.setLevel(LogLevel.ERROR)  // 전역: 에러만
logger.setModuleLevel('LocationContext', LogLevel.DEBUG)  // 위치만 디버깅

// 사용자에게는 영향 없이 위치 서비스만 상세히 추적
```

## 💡 Best Practices

### 1. 모듈명 일관성 유지

```typescript
// ✅ Good: 명확하고 일관된 모듈명
logger.info('User logged in', 'AuthService')
logger.debug('Token validated', 'AuthService')
logger.error('Login failed', error, 'AuthService')

// ❌ Bad: 불규칙한 모듈명
logger.info('User logged in', 'auth')
logger.debug('Token validated', 'Authentication')
logger.error('Login failed', error, 'login-service')
```

### 2. 계층적 모듈명 (선택사항)

```typescript
// 대규모 앱에서는 계층적 모듈명 고려
logger.debug('Fetching meals', 'API.Meals')
logger.debug('Fetching friends', 'API.Friends')
logger.debug('Socket connected', 'RealTime.Socket')
logger.debug('Notification received', 'RealTime.Notifications')

// 설정 시
logger.setModuleLevels({
  'API': LogLevel.DEBUG,           // 모든 API
  'API.Meals': LogLevel.TRACE,     // Meals API만 TRACE
  'RealTime': LogLevel.INFO,       // 모든 RealTime
  'RealTime.Socket': LogLevel.DEBUG, // Socket만 DEBUG
})
```

### 3. 환경별 기본 설정

```typescript
// constants.ts - 개발 환경
MODULE_LOG_LEVELS: {
  'AuthService': 'DEBUG',
  'API': 'DEBUG',
  'Socket': 'INFO',
}

// constants.ts - 프로덕션 (empty or minimal)
MODULE_LOG_LEVELS: {}  // 전역 설정만 사용
```

## 🚀 성능 고려사항

- 로그 레벨 체크는 **O(1)** 연산 (Map lookup)
- 불필요한 로그는 **조기에 필터링**되어 성능 영향 최소화
- 프로덕션에서는 전역 `ERROR` 또는 `WARN` 권장

## 📝 현재 설정 확인

```typescript
// 브라우저 콘솔에서
console.log(logger.getModuleLevel('AuthService'))  // LogLevel 반환
```
