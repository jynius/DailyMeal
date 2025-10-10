# Socket.IO 부하 최적화 가이드

## 📊 부하 분석

### **현재 상황**
- **연결당 메모리**: ~10KB (Map에 사용자 정보 저장)
- **브로드캐스트 빈도**: 
  - 사용자 접속/종료: `userCount` 전체 브로드캐스트
  - 식사 등록: `newMeal` 전체 브로드캐스트
  - 좋아요/댓글: `likeUpdate`, `newComment` 전체 브로드캐스트

### **예상 부하** (100명 동시 접속 기준)
```
접속/종료 1회 = 100개 메시지
식사 등록 1회 = 100개 메시지
좋아요 10회 = 1000개 메시지 ❌ 과도
```

---

## ✅ 적용된 최적화 (1단계)

### **1. 타겟 브로드캐스팅**
```typescript
// Before: 전체에게 전송
this.server.emit('newMeal', data); // 100명 → 100개 메시지

// After: 친구에게만 전송
friendUserIds.forEach(userId => {
  this.sendNotificationToUser(userId, {...});
}); // 친구 5명 → 5개 메시지 (95% 감소)
```

### **2. 좋아요 쓰로틀링**
```typescript
// 2초 이내 중복 브로드캐스트 방지
if (now - lastTime < 2000) return; // 10회 클릭 → 1회 메시지 (90% 감소)
```

### **3. 댓글 알림 타겟팅**
```typescript
// 게시물 작성자에게만 알림
this.sendNotificationToUser(data.authorId, {...}); // 1명에게만 전송
```

### **효과**
- 식사 등록: 100개 → 5개 메시지 (95% ↓)
- 좋아요: 1000개 → 100개 메시지 (90% ↓)
- 댓글: 100개 → 1개 메시지 (99% ↓)

**총 부하 감소: ~90%**

---

## 🚀 추가 최적화 (2단계 - 필요 시)

### **1. Room 기반 메시징**
현재 전체 브로드캐스트 대신 Room 단위 전송
```typescript
// 친구 피드 Room 생성
socket.join(`feed:${userId}`);

// 친구에게만 전송
this.server.to(`feed:${userId}`).emit('newMeal', data);
```

### **2. 메시지 배칭 (Batching)**
여러 이벤트를 묶어서 전송
```typescript
// 1초마다 쌓인 알림을 한 번에 전송
setInterval(() => {
  if (pendingNotifications.length > 0) {
    this.server.emit('batchNotifications', pendingNotifications);
    pendingNotifications = [];
  }
}, 1000);
```

### **3. Redis Adapter (다중 서버 환경)**
여러 서버 간 메시지 동기화
```bash
npm install @socket.io/redis-adapter redis
```

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

---

## 📈 모니터링

### **콘솔 로그로 확인**
```bash
# 백엔드 로그 확인
pm2 logs dailymeal-backend

# 출력 예시
✅ Broadcasting new meal to 5 friends: 김치찌개
🔵 Throttling like update for meal 123
```

### **성능 메트릭**
- 연결된 사용자 수: `getConnectedUsers().length`
- 평균 메시지 처리 시간: 응답 시간 측정
- 메모리 사용량: `process.memoryUsage()`

---

## 🎯 권장 사항

### **현재 규모 (100명 이하)**
✅ 1단계 최적화만 적용 (타겟팅 + 쓰로틀링)

### **중간 규모 (100~1000명)**
✅ 1단계 + Room 기반 메시징

### **대규모 (1000명 이상)**
✅ 1단계 + Room + Redis Adapter + 로드 밸런싱

---

## 🔧 적용 방법

### **백엔드 변경 사항**
1. `realtime.gateway.ts` 수정 완료 ✅
2. 호출하는 Service에서 파라미터 추가 필요:
   ```typescript
   // meal-records.service.ts
   this.realtimeGateway.broadcastNewMeal(meal, friendUserIds);
   
   // 댓글 생성 시
   this.realtimeGateway.broadcastNewComment({
     ...data,
     authorId: meal.userId // 게시물 작성자 ID 추가
   });
   ```

### **프론트엔드 변경**
변경 없음 - 기존 코드 그대로 동작 ✅

---

## 📝 요약

**Socket.IO는 적당한 부하**를 주지만, **사용자 증가 시 부하가 선형 증가**합니다.

**적용된 최적화로 90% 부하 감소**:
- 전체 브로드캐스트 → 타겟 전송
- 좋아요 쓰로틀링 (2초)
- 댓글 알림 타겟팅

**다음 단계**: Service 레이어에서 `friendUserIds`, `authorId` 파라미터 추가
