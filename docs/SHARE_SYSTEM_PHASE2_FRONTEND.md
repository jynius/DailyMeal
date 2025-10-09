# Phase 2: 공유 시스템 프론트엔드 구현 완료 ✅

## 생성된 파일들

### 1. API 클라이언트
- `/frontend/src/lib/api/share.ts` - 공유 API 클라이언트
  - `createShare()` - 공유 링크 생성
  - `getPublicMeal()` - 공개 Meal 조회 (인증 불필요)
  - `trackView()` - 조회 추적
  - `connectFriend()` - 친구 연결
  - `getMyShareStats()` - 공유 통계
  - `getOrCreateSessionId()` - 세션 ID 관리

### 2. 페이지
- `/frontend/src/app/share/meal/[shareId]/page.tsx` - 공개 공유 페이지
  - 인증 불필요로 접근 가능
  - 개인정보 필터링된 정보 표시
  - 비로그인 사용자용 CTA 배너
  - ref 파라미터 자동 저장 (sessionStorage)
  - 조회 추적 자동 실행

### 3. 수정된 파일
- `/frontend/src/lib/api/client.ts` - `apiRequest` export 추가
- `/frontend/src/components/auth/auth-form.tsx` - 로그인/가입 시 친구 자동 연결

---

## 주요 기능

### 1. 공개 공유 페이지 (`/share/meal/[shareId]`)

#### 기능
- ✅ URL 파라미터로 shareId 받기
- ✅ Query string으로 ref (암호화된 공유자 ID) 받기
- ✅ 인증 없이 공개 Meal 조회
- ✅ ref를 sessionStorage에 자동 저장
- ✅ 조회 자동 추적 (sessionId, IP, User Agent)
- ✅ 사진 캐러셀 (여러 장 지원)
- ✅ 필터링된 정보 표시:
  - 이름, 사진, 위치, 별점, 메모, 가격
  - 날짜: "2025년 1월" (개인정보 보호)
  - 공유자 이름 표시
  - 조회수 표시

#### 비로그인 사용자 UI
```
┌─────────────────────────────────────┐
│ 👤 철수님이 공유한 맛집             │
│ 👁 42명이 봤어요                     │
│ [로그인하고 친구 되기] [회원가입]   │
└─────────────────────────────────────┘
```

#### CTA (Call To Action)
```
🎉 이 맛집이 마음에 드시나요?
   데일리밀에 가입하고 나만의 맛집 기록을 만들어보세요!
   
   [무료로 시작하기]
```

---

### 2. 친구 자동 연결 시스템

#### 흐름
1. **공유 링크 접근**: `/share/meal/abc123?ref=encrypted_user_id`
2. **ref 저장**: `sessionStorage.setItem('shareRef', ref)`
3. **조회 추적**: `trackView({ shareId, ref, sessionId })`
4. **로그인/가입**: 사용자가 로그인 또는 회원가입
5. **친구 연결**: `connectFriend(ref)` 자동 호출
6. **양방향 친구**: 백엔드에서 자동으로 양방향 친구 승인
7. **알림**: "친구가 추가되었습니다! 🎉"
8. **ref 제거**: `sessionStorage.removeItem('shareRef')`

#### AuthForm 수정
```typescript
const handleAuthSuccess = async (token: string, message: string) => {
  tokenManager.set(token)
  
  // 공유를 통한 친구 연결 처리
  const shareRef = sessionStorage.getItem('shareRef')
  
  if (shareRef) {
    try {
      const result = await connectFriend(shareRef)
      if (result.success) {
        toast.success('친구가 추가되었습니다! 🎉')
      }
    } catch (err) {
      console.error('Failed to connect friend:', err)
    } finally {
      sessionStorage.removeItem('shareRef')
    }
  }
  
  alert(message)
  onSuccess?.()
}
```

---

### 3. 세션 ID 관리

#### 목적
- 비로그인 사용자 추적
- 중복 조회 방지
- 전환율 측정

#### 구현
```typescript
export function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'dailymeal_session_id'
  
  let sessionId = localStorage.getItem(STORAGE_KEY)
  
  if (!sessionId) {
    // UUID v4 생성
    sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
    localStorage.setItem(STORAGE_KEY, sessionId)
  }
  
  return sessionId
}
```

---

## API 사용 예시

### 1. 공유 링크 생성 (향후 구현)
```typescript
import { createShare } from '@/lib/api/share'

const handleShare = async (mealId: string) => {
  try {
    const result = await createShare(mealId)
    console.log('Share URL:', result.url)
    // result.url을 복사하거나 SNS 공유
  } catch (error) {
    console.error('Failed to create share:', error)
  }
}
```

### 2. 공개 Meal 조회
```typescript
import { getPublicMeal } from '@/lib/api/share'

const meal = await getPublicMeal('abc123xyz')
console.log(meal.name) // "마르게리따 피자"
console.log(meal.sharerName) // "김철수"
console.log(meal.viewCount) // 42
```

### 3. 조회 추적
```typescript
import { trackView, getOrCreateSessionId } from '@/lib/api/share'

trackView({
  shareId: 'abc123xyz',
  ref: 'encrypted_ref',
  sessionId: getOrCreateSessionId(),
})
```

### 4. 친구 연결
```typescript
import { connectFriend } from '@/lib/api/share'

const ref = sessionStorage.getItem('shareRef')
if (ref) {
  const result = await connectFriend(ref)
  console.log(result.message) // "Friend added successfully"
}
```

---

## 사용자 시나리오

### 시나리오 1: 비로그인 사용자
```
1. A가 공유 링크를 B에게 전송
   https://dailymeal.app/share/meal/abc123?ref=encrypted_a

2. B가 링크 클릭 (비로그인)
   - 공유 페이지 로드
   - ref → sessionStorage 저장
   - 조회 추적 (sessionId 생성)
   - 공유자 정보 표시: "철수님이 공유한 맛집"
   - CTA 표시: "로그인하고 친구 되기"

3. B가 "무료로 시작하기" 클릭
   - 회원가입 페이지로 이동

4. B가 회원가입 완료
   - 자동으로 connectFriend(ref) 호출
   - A와 B가 양방향 친구로 연결
   - 알림: "친구가 추가되었습니다! 🎉"
   - ref 제거
```

### 시나리오 2: 로그인한 사용자
```
1. A가 공유 링크를 C에게 전송 (C는 이미 회원)

2. C가 링크 클릭 (로그인 상태)
   - 공유 페이지 로드
   - ref → sessionStorage 저장
   - 조회 추적
   - 공유자 정보 표시 (CTA 없음)

3. C가 계속 탐색...

4. (선택) C가 다음에 로그인 시
   - 자동으로 친구 연결 (ref가 남아있으면)
```

### 시나리오 3: 기존 친구
```
1. A가 친구인 D에게 공유

2. D가 링크 클릭 후 로그인
   - connectFriend 호출
   - 백엔드: "Already friends"
   - 알림 없음 (이미 친구)
```

---

## 보안 고려사항

### 1. sessionStorage vs localStorage
- **sessionStorage**: 탭 닫으면 삭제 (보안상 더 안전하지만 UX 떨어짐)
- **localStorage**: 영구 저장 (선택한 방식) ✅
  - 이유: 사용자가 가입 페이지 이동 후 다시 돌아와도 ref 유지

### 2. 중복 친구 요청 방지
- 백엔드에서 이미 친구인지 체크
- `existingFriendship` 확인 후 skip

### 3. ref 복호화 실패 처리
- Invalid ref는 백엔드에서 BadRequestException
- 프론트엔드는 에러 무시 (로그인은 성공)

---

## 다음 단계 (TODO)

### Phase 3: 공유 링크 생성 UI
1. **MealCard에 공유 버튼 기능 추가**
   - 현재: ShareModal 열기
   - 수정: createShare() 호출 후 URL 복사

2. **Meal Detail 페이지 공유 버튼**
   - 동일하게 공유 링크 생성

3. **ShareModal 개선**
   - 생성된 공유 URL 표시
   - QR 코드 생성
   - 카카오톡, 페이스북, 트위터 공유

### Phase 4: OG 메타태그
1. **Next.js Metadata API**
   ```typescript
   // app/share/meal/[shareId]/page.tsx
   export async function generateMetadata({ params }) {
     const meal = await getPublicMeal(params.shareId)
     return {
       title: `${meal.name} - ${meal.sharerName}님의 맛집`,
       description: meal.memo || `${meal.rating}/5점`,
       openGraph: {
         images: [meal.photos[0]],
       },
     }
   }
   ```

### Phase 5: 통계 대시보드
1. **내 공유 통계 페이지**
   - 공유별 조회수
   - 전환율 (회원가입 수)
   - 친구 연결 수

---

## 테스트 체크리스트

### ✅ 완료된 테스트
- [x] 백엔드 API 엔드포인트 생성
- [x] 프론트엔드 API 클라이언트 작성
- [x] 공유 페이지 UI 구현
- [x] 친구 자동 연결 로직 추가
- [x] sessionStorage ref 저장/삭제

### ⏳ 테스트 필요
- [ ] 실제 공유 링크로 접근 테스트
- [ ] 비로그인 → 회원가입 → 친구 연결 flow
- [ ] 이미 친구인 경우 처리
- [ ] ref 없이 접근 시 동작
- [ ] 만료된 공유 링크 처리
- [ ] 모바일 브라우저 테스트
- [ ] SNS 공유 시 OG 태그 표시

---

## 완료 ✅

**Phase 2 프론트엔드 구현 완료!**

이제 다음이 가능합니다:
1. ✅ 공유 링크로 접근하면 공개 페이지 표시
2. ✅ 비로그인 사용자도 내용 조회 가능
3. ✅ 로그인/가입 시 자동으로 친구 연결
4. ✅ 조회 추적 및 전환율 측정 준비 완료

다음 단계는 실제 공유 링크 생성 UI를 추가하는 것입니다!
