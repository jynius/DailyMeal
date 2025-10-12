# 콘솔 기반 API 성능 모니터링

## 🎯 개요

브라우저 콘솔에서 실시간으로 API 성능을 모니터링합니다.

---

## 📊 콘솔 출력 예시

### 1. API 요청/응답 로그

```
🔵 API GET /meal-records
✅ API GET /meal-records - 200 [245ms]

🔵 API POST /meal-records
✅ API POST /meal-records - 201 [1234ms]

🔵 API GET /users/me
⚠️ SLOW API GET /users/me - 200 [1523ms]

🔵 API POST /auth/login
❌ API POST /auth/login - 401 [89ms]
   Error: 인증 실패
```

### 2. 반복 호출 감지

```
🔔 반복 호출 감지: GET /meal-records (15회 / 10초)
```

### 3. 주기적 통계 (30초마다)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 API 성능 통계 (최근 30초)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   총 요청: 45회
   성공률: 95.6%
   평균 응답시간: 387ms
   느린 API: 3회
   에러: 2회

⚠️ 느린 API (>1초):
   GET /meal-records/search - 1523ms
   POST /meal-records - 1234ms
   GET /users/me/statistics - 1087ms

❌ 에러 API:
   POST /auth/login - 401 (인증 실패)
   GET /friends/requests - 403 (권한 없음)

📈 최다 호출 API:
   /meal-records: 18회 (평균 245ms)
   /users/me: 8회 (평균 156ms)
   /friends: 5회 (평균 89ms)
   /share/create: 4회 (평균 678ms)
   /meal-records/search: 3회 (평균 1234ms)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🚀 사용 방법

### 자동 모니터링 (이미 적용됨)
- 모든 API 요청이 자동으로 모니터링됨
- 개발 환경에서 30초마다 통계 출력

### 수동 확인
```javascript
// F12 → 콘솔

// 전체 통계 조회
__apiMonitor.getSummary()

// 느린 API 조회
__apiMonitor.getSlowApis()

// 에러 API 조회
__apiMonitor.getErrorApis()

// 엔드포인트별 통계
__apiMonitor.getAllStats()

// 최근 20개 요청
__apiMonitor.getRecentMetrics(20)

// 통계 출력
__apiMonitor.printStats()

// 데이터 초기화
__apiMonitor.clear()
```

---

## ⚙️ 설정

### 임계값 변경
```typescript
// frontend/src/lib/api/monitor.ts

class ApiPerformanceMonitor {
  private readonly SLOW_API_THRESHOLD = 1000      // 느린 API 기준 (ms)
  private readonly WARNING_ERROR_RATE = 0.1       // 에러율 경고 기준 (10%)
  private readonly REPEAT_WARNING_THRESHOLD = 10  // 반복 호출 기준 (횟수)
  private readonly REPEAT_TIME_WINDOW = 10000     // 반복 호출 시간 창 (ms)
}
```

### 통계 출력 주기 변경
```typescript
// 30초 → 60초로 변경
this.statsInterval = setInterval(() => {
  this.printStats()
}, 60000) // 60초
```

### 프로덕션에서 비활성화
```typescript
// 이미 적용됨
if (process.env.NODE_ENV === 'development') {
  this.startPeriodicStats() // 개발 환경에서만
}
```

---

## 🎨 콘솔 스타일

| 상태 | 아이콘 | 색상 | 의미 |
|------|--------|------|------|
| 요청 시작 | 🔵 | 파란색 | API 요청 시작 |
| 성공 | ✅ | 초록색 | 정상 응답 |
| 느린 API | ⚠️ | 주황색 | 응답시간 > 1초 |
| 에러 | ❌ | 빨간색 | 4xx, 5xx 에러 |
| 반복 호출 | 🔔 | 핑크색 | 단시간 반복 호출 |
| 통계 | 📊 | 보라색 | 주기적 통계 |

---

## 🐛 디버깅 시나리오

### 1. 피드 로딩이 느림
```
콘솔 확인:
⚠️ SLOW API GET /meal-records - 200 [2345ms]

→ 페이지네이션 개선 필요
→ DB 쿼리 최적화 검토
```

### 2. 반복 API 호출
```
콘솔 확인:
🔔 반복 호출 감지: GET /meal-records (25회 / 10초)

→ useEffect 의존성 배열 확인
→ 불필요한 리렌더링 제거
```

### 3. 에러 증가
```
콘솔 확인:
❌ API POST /meal-records - 500 [123ms]
   Error: Internal Server Error

통계:
   에러: 15회 (33.3%)

→ 백엔드 로그 확인
→ 입력 데이터 검증
```

---

## 📈 성능 최적화 워크플로우

1. **콘솔에서 문제 발견**
   ```
   ⚠️ SLOW API GET /meal-records/search - 1523ms
   ```

2. **Network 탭에서 상세 확인**
   - 요청/응답 헤더
   - 페이로드 크기
   - Waterfall 차트

3. **백엔드 로그 확인**
   ```bash
   # 백엔드 로그
   tail -f backend/logs/app.log
   ```

4. **최적화 적용**
   - DB 인덱스 추가
   - 불필요한 데이터 제거
   - 캐싱 적용

5. **효과 확인**
   ```
   ✅ API GET /meal-records/search - 245ms
   (개선: 1523ms → 245ms)
   ```

---

## 💡 장점

### vs. `/api-monitor` 페이지
- ✅ **별도 페이지 불필요** - 콘솔만으로 충분
- ✅ **실시간 확인** - 즉시 피드백
- ✅ **개발 편의성** - DevTools와 자연스러운 통합
- ✅ **낮은 오버헤드** - UI 렌더링 없음

### vs. Network 탭
- ✅ **자동 분석** - 평균, P95 자동 계산
- ✅ **알림 기능** - 느린 API, 반복 호출 자동 감지
- ✅ **프로그래밍 접근** - `window.__apiMonitor` 사용 가능

---

## 🎓 Best Practices

### 1. 개발 중 실시간 모니터링
```javascript
// 콘솔 항상 열어두기 (F12)
// 30초마다 자동 통계 확인
```

### 2. 성능 목표 설정
```
- 평균 응답시간: < 500ms
- P95 응답시간: < 1000ms
- 성공률: > 99%
- 에러율: < 1%
```

### 3. 정기적 확인
```
주 1회: 통계 리뷰
- 느린 API 파악
- 반복 호출 패턴 분석
- 에러율 추세 확인
```

---

## 🔮 향후 개선 (선택사항)

### 1. LocalStorage 저장
```typescript
// 장기 추세 분석용
localStorage.setItem('api-metrics', JSON.stringify(metrics))
```

### 2. 서버로 전송
```typescript
// 프로덕션 모니터링
fetch('/api/telemetry', {
  method: 'POST',
  body: JSON.stringify(summary)
})
```

### 3. 알림 강화
```typescript
// 브라우저 알림
if (errorRate > 0.5) {
  new Notification('API 에러율 높음!')
}
```

---

**작성일**: 2025-10-10  
**상태**: ✅ 완료 및 즉시 사용 가능  
**테스트**: F12 → 콘솔 확인
