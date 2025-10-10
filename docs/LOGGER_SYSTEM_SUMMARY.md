# Frontend Logger 시스템 도입 완료

## 🎯 목표
프론트엔드의 산재된 `console.*` 호출을 체계적인 Logger 시스템으로 정리

---

## ✅ 완료된 작업

### 1. Logger 유틸리티 생성 (`frontend/src/lib/logger.ts`)

**주요 기능**:
- ✅ 환경별 자동 로그 레벨 조정 (dev: DEBUG, prod: WARN)
- ✅ 5단계 로그 레벨 (ERROR, WARN, INFO, DEBUG, TRACE)
- ✅ 컴포넌트별 컨텍스트 지원
- ✅ 타입스크립트 완전 지원
- ✅ 순환 참조 방지
- ✅ 브라우저 콘솔에서 동적 제어 (`window.__logger`)

**API**:
```typescript
// 전역 logger
import { logger } from '@/lib/logger'
logger.error('에러', error)
logger.warn('경고')
logger.info('정보')
logger.debug('디버그')
logger.trace('상세')

// 컴포넌트별 logger
import { createLogger } from '@/lib/logger'
const log = createLogger('ComponentName')
log.info('메시지', { data })
```

---

### 2. ESLint 규칙 설정 (`frontend/eslint.config.mjs`)

```javascript
{
  rules: {
    "no-console": ["warn", { allow: [] }]
  }
}
```

**효과**: 
- 개발자가 실수로 `console.*` 사용 시 경고 표시
- 코드 리뷰에서 쉽게 발견 가능

---

### 3. Next.js 프로덕션 최적화 (`frontend/next.config.ts`)

```typescript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn']
  } : false
}
```

**효과**:
- 프로덕션 빌드에서 `console.log`, `console.debug` 자동 제거
- `console.error`, `console.warn`은 유지 (중요 에러 추적용)
- 빌드 크기 감소

---

### 4. 주요 파일 마이그레이션

#### ✅ `components/meal-card.tsx`
- 6개 console 호출 → logger로 변경
- 공유 기능, 삭제 기능 로그 개선

#### ✅ `app/feed/page.tsx`
- 4개 console 호출 → logger로 변경
- 식사 기록 로딩 로그 개선

#### ✅ `app/add/page.tsx`
- 11개 console 호출 → logger로 변경
- GPS 위치 수집, FormData 전송 로그 개선

#### ✅ `app/layout.tsx`
- Kakao SDK 로드 체크를 logger로 변경

---

### 5. 문서 및 도구

#### 📚 `docs/LOGGER_MIGRATION.md`
- Logger 사용법 상세 가이드
- 마이그레이션 패턴 (Before/After)
- 로그 레벨 설명
- 나머지 파일 마이그레이션 체크리스트

#### 📚 `frontend/LOGGER_README.md`
- 빠른 참조 가이드
- 현황 요약
- 우선순위 파일 목록

#### 🛠️ `scripts/migrate-console-to-logger.sh`
- console 사용 현황 자동 스캔
- 파일별 console 개수 표시
- 마이그레이션 팁 제공

---

## 📊 현황

### Console 사용 통계
```
총 81개 console 호출
21개 파일에 분산

주요 파일:
- lib/kakao-share.ts (12개)
- lib/logger.ts (10개 - 내부 구현)
- contexts/socket-context.tsx (8개)
- lib/api/client.ts (8개)
- components/evaluate-modal.tsx (5개)
```

### 마이그레이션 진행률
- ✅ **기본 인프라**: 100% 완료
- ✅ **주요 페이지 (4개)**: 100% 완료
- ⏳ **나머지 파일 (17개)**: 0% (점진적 진행)

---

## 🚀 사용 예시

### Before (문제점)
```typescript
// ❌ 일관성 없는 포맷
console.log('🔄 Fetching meals from API...')
console.log('✅ Meals fetched:', result)
console.error('❌ Failed:', error)
console.error('Error details:', JSON.stringify(error, null, 2))

// ❌ 프로덕션에 모두 노출
console.log('🔑 Current token:', localStorage.getItem('token'))

// ❌ 환경별 제어 불가
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', data)
}
```

### After (해결)
```typescript
// ✅ 일관된 포맷
import { createLogger } from '@/lib/logger'
const log = createLogger('MealService')

log.debug('Fetching meals from API')
log.info('Meals fetched successfully', { count: result.length })
log.error('Failed to fetch meals', error)

// ✅ 프로덕션에서 자동 제거
log.debug('Token info', { tokenLength: token.length })

// ✅ 환경별 자동 제어
log.debug('Debug info', data) // 자동으로 dev에서만 출력
```

### 출력 예시

**개발 환경**:
```
[14:23:45] [DEBUG] [MealService] Fetching meals from API
[14:23:46] [INFO] [MealService] Meals fetched successfully { count: 15 }
```

**프로덕션**:
```
(로그 없음 - DEBUG, INFO 자동 제거)
```

---

## 🔄 나머지 마이그레이션 방법

### 1. 현황 확인
```bash
./scripts/migrate-console-to-logger.sh
```

### 2. 파일 선택 (우선순위)
```
1. lib/api/client.ts (8개)
2. contexts/socket-context.tsx (8개)
3. lib/kakao-share.ts (12개)
```

### 3. 마이그레이션 패턴

```typescript
// 1. import 추가
import { createLogger } from '@/lib/logger'
const log = createLogger('FileName')

// 2. console 교체
- console.log → log.debug (상세) or log.info (일반)
- console.error → log.error
- console.warn → log.warn

// 3. 데이터 포맷 변경
- console.log('msg', data1, data2)
+ log.info('msg', { data1, data2 })
```

### 4. 테스트
- 기능 동작 확인
- 개발 환경에서 로그 출력 확인
- ESLint 경고 확인

---

## 🐛 디버깅

### 브라우저 콘솔에서
```javascript
// 로그 레벨 변경
window.__logger.setLevel(4) // TRACE - 모든 로그
window.__logger.setLevel(3) // DEBUG
window.__logger.setLevel(2) // INFO
window.__logger.setLevel(1) // WARN
window.__logger.setLevel(0) // ERROR

// 콘솔 출력 토글
window.__logger.setConsoleEnabled(false) // 끄기
window.__logger.setConsoleEnabled(true)  // 켜기
```

---

## 📈 효과

### 보안
- ✅ 민감한 정보(토큰, 비밀번호) 프로덕션 노출 방지
- ✅ 디버그 정보 자동 제거

### 성능
- ✅ 프로덕션 빌드 크기 감소
- ✅ 불필요한 console 호출 제거

### 유지보수
- ✅ 일관된 로그 포맷
- ✅ 컴포넌트별 컨텍스트 추적 용이
- ✅ 환경별 로그 레벨 자동 제어

### 개발 경험
- ✅ ESLint 경고로 실수 방지
- ✅ 타입 안전한 API
- ✅ 브라우저에서 동적 제어 가능

---

## 🎓 Best Practices

### ✅ DO
```typescript
// 명확한 컨텍스트
const log = createLogger('MealCard')

// 적절한 로그 레벨
log.error('API failed', error)      // 에러
log.warn('Deprecated feature used') // 경고
log.info('User logged in')          // 일반 정보
log.debug('State changed', state)   // 디버그

// 구조화된 데이터
log.info('Meal created', { id, name, location })
```

### ❌ DON'T
```typescript
// console 직접 사용
console.log('message') // ESLint 경고

// 민감 정보 로깅
log.debug('Token', token) // 절대 안 됨

// 과도한 로깅
log.trace('every', 'little', 'thing') // 성능 저하
```

---

## 📚 참고 문서

1. **Logger 구현**: `frontend/src/lib/logger.ts`
2. **마이그레이션 가이드**: `docs/LOGGER_MIGRATION.md`
3. **빠른 참조**: `frontend/LOGGER_README.md`
4. **백엔드 Logger**: `backend/src/common/logger.service.ts`

---

## 🎉 결론

### 달성한 것
- ✅ 체계적인 Logger 시스템 구축
- ✅ 환경별 자동 로그 제어
- ✅ 프로덕션 보안 강화
- ✅ 개발 편의성 향상

### 남은 작업
- ⏳ 17개 파일의 console 마이그레이션 (점진적 진행)
- ⏳ 팀원들에게 사용법 공유

### 장기 목표
- 모든 console 사용을 logger로 마이그레이션
- 로그 수집 시스템 연동 (선택사항)
- 에러 추적 서비스 연동 (Sentry 등, 선택사항)

---

**작성일**: 2025-10-10  
**작성자**: GitHub Copilot  
**상태**: ✅ 기본 인프라 완성, 점진적 마이그레이션 진행 중
