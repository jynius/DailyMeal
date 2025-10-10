# Console 로그 정리 및 Logger 시스템

## ✅ 완료 사항

### 1. Logger 유틸리티 생성
- **파일**: `frontend/src/lib/logger.ts`
- **기능**:
  - 환경별 로그 레벨 자동 조정 (개발: DEBUG, 프로덕션: WARN)
  - 타입 안전한 API (error, warn, info, debug, trace)
  - 컴포넌트별 컨텍스트 지원
  - 순환 참조 방지
  - 브라우저 콘솔에서 동적 레벨 변경 가능

### 2. ESLint 규칙 추가
- **파일**: `frontend/eslint.config.mjs`
- **규칙**: `no-console` 경고 활성화
- **효과**: console 직접 사용 시 경고 표시

### 3. Next.js 프로덕션 최적화
- **파일**: `frontend/next.config.ts`
- **설정**: `compiler.removeConsole`
- **효과**: 프로덕션 빌드에서 console.log, console.debug 자동 제거

### 4. 주요 파일 마이그레이션 완료
- ✅ `components/meal-card.tsx`
- ✅ `app/feed/page.tsx`
- ✅ `app/add/page.tsx`
- ✅ `app/layout.tsx`

### 5. 문서 및 도구
- ✅ `docs/LOGGER_MIGRATION.md` - 상세 가이드
- ✅ `scripts/migrate-console-to-logger.sh` - 마이그레이션 헬퍼

---

## 📊 현황

### 전체 console 사용
- **총 81개** console 호출
- **21개 파일**에 분산

### 마이그레이션 상태
- ✅ **주요 4개 파일** 완료
- ⏳ **17개 파일** 남음

---

## 🚀 사용법

### 기본 사용
```typescript
import { createLogger } from '@/lib/logger'

const log = createLogger('MyComponent')

log.info('사용자 로그인')
log.debug('상태 변경', { state })
log.error('API 실패', error)
```

### 브라우저 디버깅
```javascript
// 개발자 도구 콘솔
window.__logger.setLevel(4) // 모든 로그
window.__logger.setLevel(0) // 에러만
```

---

## 🔄 나머지 마이그레이션

### 헬퍼 스크립트 실행
```bash
# console 사용 현황 확인
./scripts/migrate-console-to-logger.sh

# 특정 파일 확인
./scripts/migrate-console-to-logger.sh frontend/src/app/profile/page.tsx
```

### 우선순위 파일
1. `lib/api/client.ts` (8개)
2. `contexts/socket-context.tsx` (8개)
3. `lib/kakao-share.ts` (12개)
4. `components/evaluate-modal.tsx` (5개)
5. `app/users/page.tsx` (4개)

---

## 📚 참고 문서

- **상세 가이드**: `docs/LOGGER_MIGRATION.md`
- **Logger 구현**: `frontend/src/lib/logger.ts`
- **백엔드 Logger**: `backend/src/common/logger.service.ts`

---

## 💡 장점

### Before
```javascript
console.log('🔄 API 호출...')
console.log('📤 데이터:', data)
console.error('❌ 실패:', error)
```
→ **프로덕션에 모두 노출, 일관성 없음**

### After
```typescript
log.debug('API 호출')
log.debug('요청 데이터', { data })
log.error('API 실패', error)
```
→ **개발: 상세, 프로덕션: 최소, 일관된 포맷**

---

**작성**: 2025-10-10  
**상태**: 기본 인프라 완성, 점진적 마이그레이션 진행 중
