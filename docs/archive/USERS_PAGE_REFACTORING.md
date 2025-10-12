# Users 페이지 리팩토링 보고서

## 📋 개요
Users 페이지의 구조와 로직을 명확하게 정리하여 사용자 친구 관리 기능의 일관성과 명확성을 개선했습니다.

## 🔍 기존 문제점 분석

### 1. **"모든 사용자" 범위의 모호함**
**문제:**
- "모든 사용자" 탭이 실제로 어떤 범위의 사용자를 보여주는지 불명확
- 백엔드에는 전체 사용자 목록 API가 없고, 이메일 기반 검색만 존재
- 샘플 데이터만 표시되어 실제 동작과 괴리

**해결:**
- "모든 사용자" 탭 제거
- 3개의 명확한 탭으로 분리:
  - **내 친구**: 이미 연결된 친구 목록 (`status: 'accepted'`)
  - **친구 요청**: 받은 친구 요청 목록 (`friendId: userId, status: 'pending'`)
  - **검색 결과**: 이름/이메일 검색 결과

### 2. **친구 요청 상태의 혼란**
**문제:**
```typescript
// 기존: 한 필드에 혼재
friendRequestStatus?: 'none' | 'sent' | 'received'
```
- `sent`와 `received`를 같은 필드에서 관리
- 데이터 타입별로 상태가 달라 타입 안정성 떨어짐

**해결:**
```typescript
// User 타입: 친구 목록 전용
interface User {
  isFriend: boolean              // 친구 여부만 표시
  isNotificationEnabled: boolean // 알림 설정
}

// FriendRequest 타입: 받은 요청 전용
interface FriendRequest {
  id: string                     // friendship 레코드 ID (수락/거절 시 사용)
  userId: string                 // 요청 보낸 사람 ID
  createdAt: string              // 요청 시간
}

// SearchResult 타입: 검색 결과 전용
interface SearchResult {
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted'
}
```

### 3. **"친구 추가" 버튼의 의미 불명확**
**문제:**
- "친구 추가" 버튼이 실제로는 친구 요청을 보내는 것
- 사용자는 즉시 추가되는 것으로 오해 가능

**해결:**
- 버튼 텍스트 명확화: "친구 요청 보내기"
- 상태별 명확한 표시:
  - `none`: "친구 요청 보내기"
  - `pending_sent`: "요청 보냄 (대기 중)" (비활성)
  - `pending_received`: "상대방이 요청함 (요청 탭에서 수락)" (비활성)
  - `accepted`: "✓ 이미 친구" (비활성)

### 4. **친구 요청 프로세스 불명확**
**문제:**
- 받은 요청과 보낸 요청이 혼재
- 수락 프로세스가 UI에서 분리되지 않음

**해결:**
- 받은 요청만 "친구 요청" 탭에 표시
- 명확한 액션 버튼: "수락" / "거절"
- 보낸 요청은 검색 결과에서 "요청 보냄 (대기 중)" 상태로만 표시

## 🎯 개선된 구조

### 데이터 타입 분리
```typescript
// 1. 친구 목록 (status: 'accepted')
interface User {
  id: string
  username: string
  email: string
  // ... 기본 정보
  isFriend: boolean              // 항상 true
  isNotificationEnabled: boolean // 친구 식사 알림 설정
}

// 2. 받은 친구 요청 (friendId: userId, status: 'pending')
interface FriendRequest {
  id: string                     // friendship 레코드 ID
  userId: string                 // 요청 보낸 사람 ID
  username: string
  email: string
  // ... 기본 정보
  createdAt: string              // 요청 받은 시간
}

// 3. 보낸 친구 요청 (userId: currentUserId, status: 'pending')
interface SentRequest {
  id: string                     // friendship 레코드 ID
  friendId: string               // 요청 받은 사람 ID
  username: string
  email: string
  // ... 기본 정보
  createdAt: string              // 요청 보낸 시간
}

// 4. 검색 결과
interface SearchResult {
  id: string
  username: string
  email: string
  // ... 기본 정보
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted'
  // none: 친구 아님, 요청 없음
  // pending_sent: 내가 요청 보냄
  // pending_received: 상대가 요청 보냄
  // accepted: 이미 친구
}
```

### 탭 구조
```
┌─────────────────────────────────────┐
│  친구                                │
│  ┌──────────────────────────────┐   │
│  │ 🔍 검색...                   │   │
│  └──────────────────────────────┘   │
│  ┌──────┬──────┬──────┬────────┐   │
│  │내친구│받은요청│보낸요청│검색결과│   │
│  │  (1) │ 🔴(2)│  (1) │        │   │
│  └──────┴──────┴──────┴────────┘   │
└─────────────────────────────────────┘
```

### 사용자 액션 플로우

#### 1. 친구 검색 및 요청
```
사용자 검색 입력
  ↓
검색 결과 표시 (SearchResult[])
  ↓
"친구 요청 보내기" 버튼 클릭
  ↓
POST /api/friends/request { email }
  ↓
상태 변경: friendshipStatus = 'pending_sent'
버튼: "요청 보냄 (대기 중)" (비활성)
```

#### 2. 친구 요청 수락
```
"친구 요청" 탭에 알림 표시
  ↓
요청 목록 확인 (FriendRequest[])
  ↓
"수락" 버튼 클릭
  ↓
POST /api/friends/:friendshipId/accept
  ↓
- 요청 목록에서 제거
- 친구 목록에 추가
```

#### 3. 친구 삭제
```
"내 친구" 탭에서 친구 카드 확인
  ↓
"✓ 친구 (클릭하여 삭제)" 버튼 클릭
  ↓
확인 다이얼로그
  ↓
DELETE /api/friends/:friendId
  ↓
친구 목록에서 제거
```

#### 4. 친구 요청 취소
```
"보낸 요청" 탭에서 요청 확인
  ↓
"요청 취소" 버튼 클릭
  ↓
확인 다이얼로그
  ↓
DELETE /api/friends/:friendshipId
  ↓
보낸 요청 목록에서 제거
```

#### 5. 친구 알림 설정
```
"내 친구" 탭에서 벨 아이콘 클릭
  ↓
알림 토글 (친구의 식사 기록 알림)
  ↓
TODO: PUT /api/friends/:friendId/notification
  ↓
아이콘 변경: 🔔 ↔️ 🔕
```

## 🔗 백엔드 API 매핑

### 기존 API 엔드포인트
```typescript
// friends.controller.ts

// 1. 친구 요청 보내기
POST /friends/request
Body: { email: string }
→ Friendship 레코드 생성 (status: 'pending')

// 2. 받은 친구 요청 목록
GET /friends/requests/received
→ FriendRequest[] (friendId: userId, status: 'pending')

// 3. 보낸 친구 요청 목록 ⭐ 새로 추가
GET /friends/requests/sent
→ SentRequest[] (userId: currentUserId, status: 'pending')

// 4. 친구 요청 수락
POST /friends/:friendshipId/accept
→ Friendship.status = 'accepted'

// 5. 친구 요청 거절
POST /friends/:friendshipId/reject
→ Friendship.status = 'rejected'

// 6. 친구 요청 취소 (보낸 요청) ⭐ 새로 추가
DELETE /friends/requests/:friendshipId
→ Friendship 레코드 삭제

// 7. 내 친구 목록
GET /friends
→ User[] (status: 'accepted', 양방향 확인)

// 8. 친구 삭제
DELETE /friends/:friendId
→ Friendship 레코드 삭제

// 9. 사용자 검색
GET /friends/search/:email
→ SearchResult (friendshipStatus 포함)
```

### 추가 필요 API
```typescript
// TODO: 사용자 이름으로 검색
GET /friends/search?q={username|email}
→ SearchResult[] (다중 결과)

// TODO: 친구 알림 설정
PUT /friends/:friendId/notification
Body: { enabled: boolean }
→ 친구의 식사 기록 알림 on/off
```

## 📊 데이터베이스 구조

### Friendship 테이블
```sql
CREATE TABLE friendship (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,      -- 요청 보낸 사람
  friendId UUID NOT NULL,    -- 요청 받은 사람
  status VARCHAR(20),        -- 'pending' | 'accepted' | 'rejected'
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### 친구 관계 확인 로직
```typescript
// 양방향 친구 관계 확인
const friendship = await friendshipRepository.findOne({
  where: [
    { userId, friendId, status: 'accepted' },
    { userId: friendId, friendId: userId, status: 'accepted' }
  ]
});
```

## 🎨 UI/UX 개선사항

### 1. 명확한 상태 표시
- ✅ "✓ 친구" (녹색, 친구 삭제 가능)
- ⏳ "요청 보냄 (대기 중)" (회색, 비활성)
- 📨 "상대방이 요청함" (파란색, 비활성, 요청 탭 안내)
- ➕ "친구 요청 보내기" (파란색, 활성)

### 2. 알림 배지
```tsx
<Button>
  친구 요청
  {friendRequests.length > 0 && (
    <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
      {friendRequests.length}
    </span>
  )}
</Button>
```

### 3. UI 컴포넌트 분리
- `FriendsList`: 내 친구 목록 표시
- `ReceivedRequestsList`: 받은 친구 요청 표시 ⭐ 이름 변경
- `SentRequestsList`: 보낸 친구 요청 표시 ⭐ 새로 추가
- `SearchResultsList`: 검색 결과 표시

각 컴포넌트는 독립적으로 동작하며 명확한 책임 분리

## 🚀 향후 개선 사항

### 1. 실시간 알림
```typescript
// Socket.IO를 통한 실시간 친구 요청 알림
socket.on('friend:request', (request: FriendRequest) => {
  setFriendRequests(prev => [request, ...prev])
  // 푸시 알림 표시
})
```

### 2. 친구 추천
```typescript
// 공통 친구 기반 추천
GET /friends/suggestions
→ User[] (공통 친구 수, 유사 관심사 등)
```

### 3. 차단 기능
```typescript
// 특정 사용자 차단
POST /users/:userId/block
→ 검색 결과 제외, 요청 불가
```

### 4. 친구 그룹
```typescript
// 친구를 그룹으로 관리
- "회사 동료"
- "대학 친구"
- "가족"
```

## ✅ 체크리스트

### 완료된 항목
- [x] 타입 정의 명확화 (User, FriendRequest, SentRequest, SearchResult 분리)
- [x] 탭 구조 개선 (4개 탭: 친구/받은요청/보낸요청/검색)
- [x] 액션 플로우 명확화 (요청/수락/거절/취소/삭제)
- [x] UI 컴포넌트 분리 (FriendsList, ReceivedRequestsList, SentRequestsList, SearchResultsList)
- [x] 상태 표시 명확화 (버튼 텍스트, 색상, 비활성화)
- [x] 알림 배지 추가 (받은 요청, 보낸 요청)
- [x] 친구 알림 토글 기능
- [x] 보낸 요청 취소 기능

### TODO: 백엔드 연동
- [ ] `fetchInitialData()` - GET /friends, GET /friends/requests/received, GET /friends/requests/sent
- [ ] `handleSearch()` - GET /friends/search?q=
- [ ] `handleFriendAction('request')` - POST /friends/request
- [ ] `handleFriendAction('accept')` - POST /friends/:id/accept
- [ ] `handleFriendAction('reject')` - POST /friends/:id/reject
- [ ] `handleFriendAction('cancel')` - DELETE /friends/requests/:id
- [ ] `handleFriendAction('remove')` - DELETE /friends/:friendId
- [ ] `handleNotificationToggle()` - PUT /friends/:friendId/notification

### TODO: 백엔드 API 추가
- [ ] GET /friends/requests/sent - 보낸 친구 요청 목록
- [ ] DELETE /friends/requests/:id - 친구 요청 취소
- [ ] GET /friends/search?q= - 사용자 이름/이메일 검색
- [ ] PUT /friends/:friendId/notification - 친구 알림 설정

### TODO: 추가 기능
- [ ] 무한 스크롤 (친구 목록이 많을 경우)
- [ ] 친구 프로필 페이지 링크
- [ ] 실시간 알림 (Socket.IO)
- [ ] 친구 추천 기능
- [ ] 차단 기능

## 📝 결론

Users 페이지를 다음과 같이 개선했습니다:

1. **명확한 데이터 타입 분리**: User, FriendRequest, SentRequest, SearchResult
2. **직관적인 탭 구조**: 친구 목록, 받은 요청, 보낸 요청, 검색 결과
3. **명확한 사용자 액션**: 요청 보내기 → 수락/거절 → 친구 삭제, 보낸 요청 취소
4. **백엔드 API 매핑 문서화**: 각 기능별 API 엔드포인트 명시
5. **컴포넌트 분리**: 재사용 가능한 독립 컴포넌트 (4개)
6. **보낸 요청 관리**: 사용자가 보낸 친구 요청을 별도로 확인하고 취소 가능

이제 사용자는 친구 관리 기능을 명확하게 이해하고 사용할 수 있으며, 보낸 요청도 투명하게 관리할 수 있습니다.
