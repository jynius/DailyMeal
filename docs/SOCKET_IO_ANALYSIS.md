# Socket.IO 구조 분석 및 정리

## ✅ 수정 완료 (2025-10-09)

### **문제점:**
- `socket-simple.tsx`와 `socket-context.tsx` 두 개의 Context 파일 존재
- `providers.tsx`는 `socket-simple` 사용 (notifications 기능 없음)
- `realtime-notifications.tsx`는 `socket-context` import (notifications 있음)
- **두 개의 다른 Context 혼용** → notifications 작동 안 함

### **해결책:**
- ✅ `providers.tsx`를 `socket-context` import로 변경
- ✅ `socket-simple.tsx` 파일 삭제
- ✅ 모든 컴포넌트가 동일한 Context 사용

---

## 📊 현재 구조 (수정 후)

### 1. **Socket Context 파일**

#### ✅ **사용 중: `socket-context.tsx`** (통일됨)
- **경로**: `frontend/src/contexts/socket-simple.tsx`
- **상태**: 실제로 사용됨 (`providers.tsx`에서 import)
- **특징**: 
  - 간단한 구조 (73 lines)
  - polling transport만 사용
  - 기본 연결/해제만 처리
  - notifications 기능 **없음**

```typescript
interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectedUsers: number
}
```

---

#### ⚠️ **사용 안 됨: `socket-context.tsx`**
- **경로**: `frontend/src/contexts/socket-context.tsx`
- **상태**: **import되지 않음** (사용되지 않는 코드)
- **특징**:
  - 복잡한 구조 (218 lines)
  - polling + websocket 지원
  - 실시간 notifications 관리
  - joinRoom/leaveRoom 기능
  - GPS, 네트워크 상태 체크

```typescript
interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectedUsers: number
  notifications: RealTimeNotification[]  // ⚠️ 추가 기능
  clearNotifications: () => void
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
}
```

---

### 2. **Socket Provider 연결 구조**

```
app/layout.tsx
  └─ Providers (components/providers.tsx)
       └─ SocketProvider (contexts/socket-simple.tsx) ✅ 실제 사용
```

**한 번만 생성**되어 전체 앱에서 공유됨 (올바른 구조) ✅

---

### 3. **useSocket() Hook 사용 위치**

| 파일 | import 경로 | 사용 기능 | 문제점 |
|------|-------------|----------|--------|
| `components/realtime-notifications.tsx` | ✅ `socket-context` | notifications, clearNotifications | **올바름** |
| `app/page.tsx` | ❌ `socket-context` | notifications, isConnected | **잘못된 import** |
| `app/feed/page.tsx` | ❌ `socket-context` | notifications, connectedUsers | **잘못된 import** |
| `components/providers.tsx` | ✅ `socket-simple` | SocketProvider | **실제 제공자** |

**심각한 문제**: 
- `providers.tsx`는 `socket-simple`을 사용 (notifications 없음)
- `realtime-notifications.tsx`는 `socket-context`를 import (notifications 있음)
- **두 개의 다른 Context를 혼용** 🚨

---

## 🚨 발견된 문제점

### 1. **Context 파일 중복**
- `socket-simple.tsx` (실제 사용)
- `socket-context.tsx` (사용 안 됨, 데드 코드)

### 2. **타입 불일치**
```typescript
// 컴포넌트에서 기대하는 타입
const { notifications, clearNotifications } = useSocket()

// 실제 제공되는 타입 (socket-simple.tsx)
interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectedUsers: number
  // notifications, clearNotifications 없음! ⚠️
}
```

### 3. **페이지별 중복 import**
여러 페이지에서 `useSocket()`을 호출하지만, 실제로는 **한 번만 연결**되어 공유되므로 문제없음. 하지만 불필요하게 여러 곳에서 사용 중.

---

## ✅ 권장 구조

### **Option 1: socket-simple.tsx 확장** (추천)
현재 사용 중인 `socket-simple.tsx`에 notifications 기능 추가

```typescript
interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectedUsers: number
  notifications: RealTimeNotification[]     // 추가
  clearNotifications: () => void            // 추가
}
```

**장점**:
- 기존 구조 유지
- 최소한의 수정
- `socket-context.tsx` 삭제 가능

---

### **Option 2: socket-context.tsx로 교체**
`providers.tsx`에서 import 변경

```typescript
// Before
import { SocketProvider } from '@/contexts/socket-simple'

// After
import { SocketProvider } from '@/contexts/socket-context'
```

**장점**:
- 더 많은 기능 (notifications, rooms, GPS)
- 이미 구현되어 있음

**단점**:
- 더 복잡함 (218 lines)
- 불필요한 기능 포함 (joinRoom, leaveRoom 등)

---

### **Option 3: 통합 및 최적화** (권장)
두 파일의 장점만 결합:
- `socket-simple.tsx`의 간결함
- `socket-context.tsx`의 notifications 기능
- 불필요한 기능 제거 (GPS, network status, rooms)

---

## 📝 정리 방안

### **즉시 수정 사항:**

1. **타입 에러 해결**
   - `socket-simple.tsx`에 notifications 관련 타입/상태 추가
   - 또는 `socket-context.tsx`로 교체

2. **데드 코드 제거**
   - 사용 안 하는 socket context 파일 삭제

3. **불필요한 useSocket 호출 정리**
   - `app/page.tsx`: Socket 정보 표시만 함 (제거 가능)
   - `app/feed/page.tsx`: Socket 정보 표시만 함 (제거 가능)
   - `components/realtime-notifications.tsx`: 유지 (실제 사용)

---

## 🎯 최종 추천 구조

```
frontend/src/
├── app/
│   └── layout.tsx                    # SocketProvider 한 번만 래핑
├── components/
│   ├── providers.tsx                 # SocketProvider import
│   └── realtime-notifications.tsx    # useSocket() 사용 (유일)
└── contexts/
    └── socket-context.tsx            # 통합된 단일 파일
```

**핵심 원칙:**
- ✅ Socket은 **layout.tsx에서 한 번만** Provider로 래핑
- ✅ 실제 Socket 데이터가 필요한 컴포넌트에서만 `useSocket()` 호출
- ✅ 단순히 표시만 하는 곳은 props로 전달받기

---

## 🔧 수정 우선순위

### ⚠️ **긴급 (현재 작동하지 않음):**
```typescript
// providers.tsx가 socket-simple 사용
// realtime-notifications.tsx가 socket-context import
// → 두 개의 다른 Context! notifications 작동 안 함!
```

### Priority 1 (즉시 수정 필요):
**방법 1: socket-context로 통일 (추천)**
```typescript
// components/providers.tsx
// Before
import { SocketProvider } from '@/contexts/socket-simple'

// After  
import { SocketProvider } from '@/contexts/socket-context'
```

**방법 2: 모든 import를 socket-simple로 변경**
```typescript
// app/page.tsx, app/feed/page.tsx, realtime-notifications.tsx
// Before
import { useSocket } from '@/contexts/socket-context'

// After
import { useSocket } from '@/contexts/socket-simple'

// 단, notifications 기능 제거 필요
```

### Priority 2 (중요):
- [ ] 사용하지 않는 socket context 파일 삭제
- [ ] 중복 import 정리

### Priority 3 (선택):
- [ ] 불필요한 useSocket() 호출 제거
- [ ] Socket 상태를 props로 전달하도록 리팩토링

---

## 📊 파일 크기 비교

| 파일 | 라인 수 | 상태 | 기능 |
|------|---------|------|------|
| `socket-simple.tsx` | 73 | ✅ 사용 중 | 기본 연결만 |
| `socket-context.tsx` | 218 | ❌ 미사용 | 전체 기능 |

**결론**: 현재 73줄짜리 simple 버전을 사용 중이지만, 컴포넌트들은 218줄짜리 context의 기능을 기대하고 있음 → **타입 불일치 문제** 🚨
