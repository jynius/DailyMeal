# API 성능 모니터링 빠른 시작

## 🚀 바로 사용하기

### 1. 앱 실행
```bash
npm run dev
# http://localhost:3000
```

### 2. 모니터링 대시보드 접근
```
http://localhost:3000/api-monitor
```

### 3. 브라우저 콘솔 디버깅
```javascript
// F12 → 콘솔 탭
window.__apiMonitor.getAllStats()      // 전체 통계
window.__apiMonitor.getSlowApis()      // 느린 API
window.__apiMonitor.getErrorApis()     // 에러 API
window.__apiMonitor.getSummary()       // 요약
```

---

## 📊 주요 기능

### ✅ 자동 모니터링
- 모든 API 요청 자동 추적
- 응답 시간 측정
- 에러 감지
- 로그 기록

### ✅ 실시간 대시보드
- 총 요청/성공률/평균 응답시간
- 엔드포인트별 상세 통계
- 느린 API/에러 시각화
- 10초 자동 새로고침

### ✅ 자동 알림
- 느린 API (>1초) 콘솔 경고
- 높은 에러율 (>10%) 알림
- 지속적 성능 저하 감지

---

## 📈 수집 메트릭

- **응답 시간**: 평균, 최소, 최대, P95
- **성공률**: 성공/실패 횟수, 에러율
- **호출 빈도**: 엔드포인트별 사용량
- **에러 추적**: HTTP 상태 코드, 에러 메시지

---

## 🎯 사용 시나리오

### 개발 중
1. API 요청 성능 실시간 확인
2. 느린 API 즉시 발견
3. 에러 패턴 분석

### 디버깅
```javascript
// 특정 API 통계 확인
__apiMonitor.getEndpointStats('/meal-records')

// 최근 20개 요청 확인
__apiMonitor.getRecentMetrics(20)
```

### 성능 최적화
1. `/api-monitor` 대시보드 확인
2. 느린 API 파악 (노란색/빨간색)
3. 백엔드 쿼리 최적화
4. 개선 후 재확인

---

## 📚 상세 문서

- **전체 가이드**: `docs/API_MONITORING_COMPLETE.md`
- **API 현황**: `docs/API_MONITORING_PLAN.md`

---

**즉시 사용 가능! 🎉**
