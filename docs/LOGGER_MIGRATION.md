# Frontend Logger 마이그레이션 가이드

## 📋 개요

프론트엔드의 산재된 `console.*` 호출을 체계적인 Logger 시스템으로 마이그레이션했습니다.

### 문제점
- ❌ 50개 이상의 `console.log/error/warn` 사용
- ❌ 디버깅 로그가 프로덕션에 노출
- ❌ 일관성 없는 로그 포맷 (이모지, 텍스트 혼재)
- ❌ 환경별 로그 레벨 제어 불가능

### 해결
- ✅ 통합 Logger 유틸리티 (`frontend/src/lib/logger.ts`)
- ✅ ESLint 규칙으로 `console` 직접 사용 금지
- ✅ 프로덕션 빌드에서 로그 자동 제거
- ✅ 환경별 로그 레벨 자동 조정

---

## 🚀 Logger 사용법

### 기본 사용

```typescript
import { logger } from '@/lib/logger'

// 에러 로그 (항상 출력)
logger.error('API 호출 실패', error)

// 경고 로그
logger.warn('사용자 입력 검증 실패')

// 정보 로그
logger.info('사용자 로그인 성공')

// 디버그 로그 (개발 환경에서만)
logger.debug('상태 변경', { oldState, newState })

// 상세 추적 로그 (개발 환경에서만)
logger.trace('함수 호출', { params })
```

### 컴포넌트별 Logger

```typescript
import { createLogger } from '@/lib/logger'

const log = createLogger('MealCard')

export function MealCard() {
  log.info('컴포넌트 렌더링')
  log.debug('props 변경', { props })
  log.error('이미지 로딩 실패', error)
}
```

---

## 🔄 마이그레이션 패턴

### Before → After

#### 1. 기본 로그
```typescript
// ❌ Before
console.log('🔄 Fetching meals from API...')
console.log('✅ Meals fetched:', result)

// ✅ After
log.debug('Fetching meals from API')
log.info('Meals fetched successfully', { count: result.length })
```

#### 2. 에러 로그
```typescript
// ❌ Before
console.error('❌ API 호출 실패:', error)
console.error('Error details:', JSON.stringify(error, null, 2))

// ✅ After
log.error('API 호출 실패', error)
```

#### 3. 디버그 정보
```typescript
// ❌ Before
console.log('📤 Sending FormData:')
console.log('  - name:', formData.name)
console.log('  - photos:', formData.photos.length)

// ✅ After
log.debug('Sending FormData', {
  name: formData.name,
  photosCount: formData.photos.length
})
```

#### 4. 조건부 로그
```typescript
// ❌ Before
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}

// ✅ After
log.debug('Debug info', data) // 자동으로 환경 체크
```

---

## 📊 로그 레벨

| 레벨 | 개발 환경 | 프로덕션 | 용도 |
|------|-----------|---------|------|
| **ERROR** | ✅ | ✅ | 에러, 예외 상황 |
| **WARN** | ✅ | ✅ | 경고, 주의 필요 |
| **INFO** | ✅ | ❌ | 일반 정보, 상태 변경 |
| **DEBUG** | ✅ | ❌ | 디버깅 정보, 상세 데이터 |
| **TRACE** | ✅ | ❌ | 함수 호출 추적, 매우 상세 |

### 환경별 설정

- **개발 환경**: `DEBUG` 레벨 (모든 로그 출력)
- **프로덕션**: `WARN` 레벨 (에러/경고만)

---

## 🛠️ 설정

### 1. ESLint 규칙 (`frontend/eslint.config.mjs`)

```javascript
{
  rules: {
    "no-console": ["warn", { allow: [] }]
  }
}
```

→ `console.*` 사용 시 경고 표시

### 2. Next.js 프로덕션 빌드 (`frontend/next.config.ts`)

```typescript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn']
  } : false
}
```

→ 프로덕션에서 `console.log`, `console.debug` 자동 제거

---

## 🎯 마이그레이션 체크리스트

### 완료된 파일
- [x] `frontend/src/lib/logger.ts` - Logger 유틸리티 생성
- [x] `frontend/src/components/meal-card.tsx`
- [x] `frontend/src/app/feed/page.tsx`
- [x] `frontend/src/app/add/page.tsx`
- [x] `frontend/src/app/layout.tsx`

### 남은 파일 (50개 console 중 ~35개 남음)
- [ ] `frontend/src/app/profile/page.tsx`
- [ ] `frontend/src/app/settings/page.tsx`
- [ ] `frontend/src/app/search/page.tsx`
- [ ] `frontend/src/app/meal/[id]/page.tsx`
- [ ] `frontend/src/app/restaurants/[id]/page.tsx`
- [ ] `frontend/src/app/users/page.tsx`
- [ ] `frontend/src/app/share/meal/[shareId]/page.tsx`

---

## 🔍 나머지 파일 마이그레이션 방법

### 자동 검색

```bash
# 모든 console 사용 찾기
cd frontend
grep -r "console\." src/ --include="*.tsx" --include="*.ts"
```

### 일괄 변경 패턴

1. **파일 상단에 import 추가**
```typescript
import { createLogger } from '@/lib/logger'
const log = createLogger('ComponentName')
```

2. **console 호출 변경**
```typescript
// console.log → log.debug or log.info
// console.error → log.error
// console.warn → log.warn
```

3. **데이터 전달 방식 변경**
```typescript
// ❌ console.log('message:', data1, data2)
// ✅ log.info('message', { data1, data2 })
```

---

## 🐛 디버깅 팁

### 브라우저 콘솔에서 로그 레벨 변경

```javascript
// 개발자 도구 콘솔에서 실행
window.__logger.setLevel(4) // TRACE 레벨로 변경 (모든 로그 출력)
window.__logger.setLevel(0) // ERROR 레벨로 변경 (에러만)
```

### 특정 컴포넌트만 디버그

```typescript
const log = createLogger('MyComponent')

// 필요한 곳에서만 trace 사용
log.trace('함수 진입', { params })
```

---

## 📈 효과

### Before
```
✅ Share link created: {url: "...", shareId: "...", expiresAt: "..."}
🔑 Current token: eyJhbGciOiJIUzI1NiIsInR5cCI...
📤 Sending FormData:
  - name: 10월 10일 저녁
  - photos count: 2
```
→ **프로덕션에 모두 노출** 😱

### After
```
[14:23:45] [INFO] [MealCard] Share link created successfully
```
→ **개발: 상세 로그, 프로덕션: 최소 로그** ✅

---

## 🎓 Best Practices

1. **Context 명확히**: `createLogger('MyComponent')` 사용
2. **적절한 레벨 선택**: 
   - 에러 → `error`
   - 사용자 동작 → `info`
   - 내부 상태 → `debug`
3. **데이터는 객체로**: `log.info('message', { data })`
4. **민감 정보 제외**: 토큰, 비밀번호 등은 로그하지 않기
5. **이모지 사용 자제**: 포맷팅은 Logger가 처리

---

## 🚨 주의사항

### ⚠️ 마이그레이션 시
- **점진적 진행**: 파일별로 하나씩 변경
- **테스트 필수**: 변경 후 기능 동작 확인
- **에러 핸들링 유지**: `try-catch` 블록 그대로 유지

### ⚠️ 특수 케이스
- **서버 컴포넌트**: Logger 사용 가능하지만 서버 로그로 출력됨
- **Script 태그 내**: `window.__logger` 사용 (layout.tsx 참고)

---

## 📚 추가 참고

- Logger 구현: `frontend/src/lib/logger.ts`
- 백엔드 Logger: `backend/src/common/logger.service.ts`
- ESLint 설정: `frontend/eslint.config.mjs`
- Next.js 설정: `frontend/next.config.ts`

---

**작성일**: 2025-10-10  
**작성자**: GitHub Copilot  
**상태**: 진행 중 (주요 파일 완료, 나머지 35개 파일 마이그레이션 필요)
