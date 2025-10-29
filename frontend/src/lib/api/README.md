# API 모듈 구조

DailyMeal 프론트엔드의 API 클라이언트 모듈입니다.

## 📁 파일 구조

```
frontend/src/lib/api/
├── client.ts          # 🔧 저수준 HTTP 헬퍼 (apiRequest)
├── monitor.ts         # 📊 성능 모니터링 (내부 전용)
├── token.ts           # 🔑 토큰 관리 유틸리티
├── auth.ts            # 🔐 인증 API (로그인/회원가입)
├── meals.ts           # 🍱 식사 기록 API
├── friends.ts         # 👥 친구 관리 API
├── profile.ts         # 👤 프로필 API
├── share.ts           # 🔗 공유 기능 API
├── restaurants.ts     # 🍴 맛집 API
├── locations.ts       # 📍 장소 API
├── index.ts           # 📦 중앙 엔트리 포인트
└── README.md          # 📖 이 문서
```

## 📊 모듈별 책임

### 🔒 내부 전용 모듈

#### `client.ts`
- **역할**: 저수준 HTTP 요청 처리
- **주요 기능**:
  - `apiRequest<T>()`: 공통 HTTP 요청 헬퍼
  - 토큰 자동 인증
  - 에러 처리 및 리다이렉션
  - 성능 모니터링 통합
- **사용처**: API 모듈 내부에서만 사용
- **Import**: `import { apiRequest } from './client'` (API 모듈 내에서만)

#### `monitor.ts`
- **역할**: API 성능 모니터링
- **주요 기능**:
  - 요청/응답 시간 측정
  - 에러 추적
  - 콘솔 기반 통계 (개발 환경)
- **사용처**: `client.ts`에서 자동 사용, 디버깅 페이지에서만 직접 접근
- **Import**: `import { apiMonitor } from './monitor'` (특수한 경우만)
- **통계 확인**: 브라우저 콘솔에서 `apiStats()` 호출

### ✅ 공개 모듈 (외부 사용 가능)

#### `token.ts`
- **역할**: JWT 토큰 관리
- **주요 기능**:
  - `tokenManager.get()`: 토큰 가져오기
  - `tokenManager.set(token)`: 토큰 저장 (localStorage + 쿠키)
  - `tokenManager.remove()`: 토큰 제거 (로그아웃)
- **사용처**: 인증 가드, 소켓 연결, 로그인/로그아웃

#### `auth.ts`
- **역할**: 인증 관련 API
- **주요 메서드**:
  - `authApi.register()`: 회원가입
  - `authApi.login()`: 로그인
  - `authApi.findId()`: 아이디 찾기
  - `authApi.resetPassword()`: 비밀번호 재설정
  - `authApi.requestPasswordReset()`: 비밀번호 재설정 이메일 요청

#### `meals.ts`
- **역할**: 식사 기록 관리 API
- **주요 메서드**:
  - `mealRecordsApi.getMealRecords()`: 식사 기록 목록 조회
  - `mealRecordsApi.getMealRecordById()`: 특정 식사 기록 조회
  - `mealRecordsApi.createMealRecord()`: 새 식사 기록 생성
  - `mealRecordsApi.updateMealRecord()`: 식사 기록 수정
  - `mealRecordsApi.deleteMealRecord()`: 식사 기록 삭제
  - `mealRecordsApi.getStatistics()`: 통계 조회

#### `friends.ts`
- **역할**: 친구 관리 API
- **주요 메서드**:
  - `friendsApi.getFriends()`: 친구 목록 조회
  - `friendsApi.addFriend()`: 친구 추가
  - `friendsApi.removeFriend()`: 친구 삭제
  - `friendsApi.searchUsers()`: 사용자 검색

#### `profile.ts`
- **역할**: 사용자 프로필 API
- **주요 메서드**:
  - `profileApi.getProfile()`: 프로필 조회
  - `profileApi.updateProfile()`: 프로필 수정
  - `profileApi.uploadProfileImage()`: 프로필 이미지 업로드
  - `profileApi.getStatistics()`: 사용자 통계 조회

#### `share.ts`
- **역할**: 공유 기능 API
- **주요 함수**:
  - `createShare()`: 공유 링크 생성
  - `getShareByToken()`: 공유 토큰으로 데이터 조회
  - `getMyShareStats()`: 내 공유 통계

#### `restaurants.ts`
- **역할**: 맛집 정보 API
- **주요 메서드**:
  - `restaurantsApi.getRestaurants()`: 맛집 목록 조회 (위치 기반)

#### `locations.ts`
- **역할**: 장소 관련 API
- **주요 메서드**:
  - `locationsApi.getFrequentLocations()`: 자주 가는 장소 목록

#### `index.ts`
- **역할**: 중앙 엔트리 포인트
- **기능**: 공개 API만 재내보내기 (re-export)

## 🔄 사용 방법

### ✅ 권장: index.ts를 통한 import

```typescript
import { 
  authApi, 
  tokenManager, 
  mealRecordsApi,
  friendsApi,
  profileApi,
  restaurantsApi,
  locationsApi 
} from '@/lib/api'

// 사용 예시
const result = await authApi.login({ email, password })
tokenManager.set(result.token)

const meals = await mealRecordsApi.getMealRecords()
const friends = await friendsApi.getFriends()
```

### ⚠️ 특수한 경우만: 직접 import

```typescript
// API 모듈 내부에서만
import { apiRequest } from '@/lib/api/client'

// 디버깅/모니터링 페이지에서만
import { apiMonitor, type ApiStats } from '@/lib/api/monitor'
```

## 📝 새로운 API 추가하기

### 1. 새 API 파일 생성

```typescript
// frontend/src/lib/api/example.ts
import { apiRequest } from './client'

export const exampleApi = {
  getData: async () => {
    return apiRequest<DataType>('/example/data')
  },
  
  createData: async (data: CreateData) => {
    return apiRequest<DataType>('/example/data', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
```

### 2. index.ts에 추가

```typescript
// frontend/src/lib/api/index.ts
export * from './example'  // 추가
```

### 3. 컴포넌트에서 사용

```typescript
import { exampleApi } from '@/lib/api'

const data = await exampleApi.getData()
```

## 🎨 설계 원칙

### 1. 관심사 분리 (Separation of Concerns)
- 각 파일은 단일 도메인/책임만 담당
- 저수준 헬퍼와 도메인 API 분리

### 2. 명시적 공개 (Explicit Public API)
- `index.ts`를 통해서만 공개
- 내부 구현은 직접 import 방지

### 3. 타입 안정성 (Type Safety)
- 모든 API 응답에 TypeScript 타입 지정
- Generic을 통한 유연한 타입 처리

### 4. 에러 처리 (Error Handling)
- 중앙화된 에러 처리 (`client.ts`)
- 인증 에러 자동 처리
- 사용자 친화적 에러 메시지

### 5. 성능 모니터링 (Performance Monitoring)
- 모든 API 요청 자동 모니터링
- 개발 환경에서 콘솔 통계 제공
- 느린 API 자동 감지

## 🛠️ 디버깅

### API 성능 통계 확인

브라우저 개발자 도구 콘솔에서:

```javascript
// 현재 API 성능 통계 출력
apiStats()
```

출력 내용:
- 총 요청 수
- 성공률
- 평균 응답 시간
- 느린 API 목록
- 에러 API 목록
- 최다 호출 API

### 개별 API 요청 로그

모든 API 요청은 자동으로 콘솔에 로그됩니다:

```
🔵 API GET /meal-records
✅ API GET /meal-records - 200 [234ms]
```

- 🔵: 요청 시작
- ✅: 성공 (200-399)
- ⚠️: 느린 API (>1초)
- ❌: 에러 (400+)

## 📋 체크리스트

새 API 모듈 추가 시:

- [ ] 적절한 파일명 선택 (도메인별)
- [ ] `apiRequest` 사용하여 구현
- [ ] TypeScript 타입 정의
- [ ] `index.ts`에 export 추가
- [ ] JSDoc 주석 작성
- [ ] 에러 처리 확인
- [ ] 테스트 코드 작성 (선택)

## 🔗 관련 문서

- [API 서버 문서](../../../../backend/README.md)
- [타입 정의](../../types/index.ts)
- [상수 정의](../constants.ts)
