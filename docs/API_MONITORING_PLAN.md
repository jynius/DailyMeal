# DailyMeal API 사용 현황 및 모니터링 계획

## 📊 Frontend API 사용 현황

### 1. 인증 API (`/auth/*`)
**파일**: `frontend/src/lib/api/client.ts`

| 엔드포인트 | 메서드 | 사용처 | 빈도 |
|-----------|--------|--------|------|
| `/auth/register` | POST | 회원가입 | 낮음 |
| `/auth/login` | POST | 로그인 | 중간 |

**사용 컴포넌트**:
- `components/auth/auth-form.tsx`
- `app/login/page.tsx`
- `app/signup/page.tsx`

---

### 2. 식사 기록 API (`/meal-records/*`)
**파일**: `frontend/src/lib/api/client.ts`

| 엔드포인트 | 메서드 | 사용처 | 빈도 | 중요도 |
|-----------|--------|--------|------|--------|
| `/meal-records` | POST | 식사 등록 | 높음 | ⭐⭐⭐ |
| `/meal-records` | GET | 목록 조회 | 매우높음 | ⭐⭐⭐⭐ |
| `/meal-records/:id` | GET | 상세 조회 | 높음 | ⭐⭐⭐ |
| `/meal-records/:id` | PATCH | 식사 수정 | 중간 | ⭐⭐ |
| `/meal-records/:id` | DELETE | 식사 삭제 | 낮음 | ⭐⭐ |
| `/meal-records/search` | GET | 검색 | 중간 | ⭐⭐⭐ |
| `/meal-records/statistics` | GET | 통계 | 낮음 | ⭐⭐ |
| `/meal-records/locations/frequent` | GET | 자주가는 장소 | 중간 | ⭐⭐ |

**사용 컴포넌트**:
- `app/feed/page.tsx` (목록 조회 - 매우 빈번)
- `app/add/page.tsx` (등록)
- `app/meal/[id]/page.tsx` (상세)
- `components/meal-card.tsx` (삭제)
- `components/evaluate-modal.tsx` (수정, 평가)

---

### 3. 사용자/프로필 API (`/users/*`)
**파일**: `frontend/src/lib/api/profile.ts`

| 엔드포인트 | 메서드 | 사용처 | 빈도 |
|-----------|--------|--------|------|
| `/users/me` | GET | 프로필 조회 | 높음 |
| `/users/me` | PATCH | 프로필 수정 | 낮음 |
| `/users/me/profile-image` | POST | 이미지 업로드 | 낮음 |
| `/users/me/statistics` | GET | 통계 조회 | 낮음 |
| `/users/me/settings` | GET | 설정 조회 | 낮음 |
| `/users/me/settings` | PATCH | 설정 수정 | 낮음 |

**사용 컴포넌트**:
- `app/profile/page.tsx`
- `app/settings/page.tsx`
- `app/statistics/page.tsx`

---

### 4. 친구 API (`/friends/*`)
**파일**: `frontend/src/lib/api/friends.ts`

| 엔드포인트 | 메서드 | 사용처 | 빈도 |
|-----------|--------|--------|------|
| `/friends` | GET | 친구 목록 | 중간 |
| `/friends/search` | GET | 사용자 검색 | 중간 |
| `/friends/request` | POST | 친구 요청 | 낮음 |
| `/friends/requests/received` | GET | 받은 요청 | 낮음 |
| `/friends/requests/sent` | GET | 보낸 요청 | 낮음 |
| `/friends/:id/accept` | POST | 요청 수락 | 낮음 |
| `/friends/:id/reject` | POST | 요청 거절 | 낮음 |
| `/friends/:friendId` | DELETE | 친구 삭제 | 낮음 |
| `/friends/:friendId/notification` | PATCH | 알림 설정 | 낮음 |

**사용 컴포넌트**:
- `app/users/page.tsx`
- `components/evaluate-modal.tsx` (친구 선택)

---

### 5. 공유 API (`/share/*`)
**파일**: `frontend/src/lib/api/share.ts`

| 엔드포인트 | 메서드 | 사용처 | 빈도 |
|-----------|--------|--------|------|
| `/share/create` | POST | 공유 링크 생성 | 중간 |
| `/share/meal/:shareId` | GET | 공유 조회 (비인증) | 높음 |
| `/share/track-view` | POST | 조회 추적 | 높음 |
| `/share/connect-friend` | POST | 친구 연결 | 낮음 |
| `/share/my-stats` | GET | 공유 통계 | 낮음 |

**사용 컴포넌트**:
- `components/meal-card.tsx`
- `app/meal/[id]/page.tsx`
- `app/share/meal/[shareId]/page.tsx`
- `components/share-modal.tsx`

---

### 6. 기타 API
**파일**: `backend/src/app.controller.ts`

| 엔드포인트 | 메서드 | 사용처 | 빈도 |
|-----------|--------|--------|------|
| `/geocode/reverse` | GET | 역지오코딩 | 중간 |
| `/restaurants` | GET | 음식점 검색 | 중간 |

---

## 🎯 성능 모니터링이 필요한 핵심 API (우선순위)

### 최우선 (P0)
1. **`GET /meal-records`** - 피드 목록 (가장 빈번)
2. **`POST /meal-records`** - 식사 등록 (파일 업로드 포함)
3. **`GET /meal-records/:id`** - 식사 상세

### 높음 (P1)
4. **`GET /share/meal/:shareId`** - 공유 조회
5. **`GET /meal-records/search`** - 검색
6. **`GET /users/me`** - 프로필 조회

---

## 🛠️ 제안하는 모니터링 시스템

### 옵션 1: 커스텀 인터셉터 (가벼운 방법) ✅ 추천
**장점**:
- 빠른 구현
- 의존성 없음
- 로그 기반 분석

**기능**:
- API 응답 시간 측정
- 에러율 추적
- 느린 API 경고
- 로그 파일 기록

### 옵션 2: APM 도구 연동 (전문적 방법)
**추천 도구**:
- **Sentry** (에러 추적 + 성능)
- **New Relic** (APM)
- **Datadog** (종합 모니터링)

**장점**:
- 전문적인 대시보드
- 실시간 알림
- 자동 분석

**단점**:
- 비용 발생 (무료 플랜 제한)
- 설정 필요

### 옵션 3: 하이브리드
- 커스텀 인터셉터로 기본 모니터링
- 프로덕션에서는 Sentry 연동

---

## 📈 모니터링 메트릭

### 1. 응답 시간
- 평균 응답 시간
- P95, P99 응답 시간
- 느린 API (>1초)

### 2. 에러율
- HTTP 4xx (클라이언트 에러)
- HTTP 5xx (서버 에러)
- 네트워크 에러

### 3. 사용량
- API 호출 횟수
- 엔드포인트별 호출 빈도

### 4. 사용자 경험
- 타임아웃 발생률
- 재시도 횟수

---

## 🚀 구현 계획

### Phase 1: 기본 모니터링 (커스텀 인터셉터)
1. ✅ API 인터셉터 생성
2. ✅ 성능 로거 추가
3. ✅ 대시보드 페이지 생성 (선택)

### Phase 2: 향상된 모니터링
1. ⏳ Sentry 연동 (에러 추적)
2. ⏳ 알림 시스템
3. ⏳ 성능 개선 자동화

---

## 💡 즉시 적용 가능한 개선사항

### Frontend
1. **API 요청 중복 제거** (React Query/SWR 도입)
2. **캐싱 전략** (자주 조회되는 데이터)
3. **낙관적 업데이트** (UX 개선)
4. **요청 디바운싱** (검색)

### Backend
1. **DB 쿼리 최적화** (N+1 문제 해결)
2. **캐싱** (Redis)
3. **페이지네이션 개선**
4. **압축** (gzip)

---

**작성일**: 2025-10-10  
**다음 단계**: 커스텀 API 모니터링 인터셉터 구현
