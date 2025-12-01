# AI Phase 1 테스트 시나리오 & 케이스

**작성일**: 2025-11-27  
**대상**: 식습관 분석 & 추천 기능  
**테스트 환경**: Backend (NestJS) + PostgreSQL

---

## 🎭 테스트 시나리오

### Scenario 1: 신규 사용자 - 데이터 부족
**목적**: 데이터가 충분하지 않을 때의 처리

**배경**:
- 가입한 지 1일
- 식사 기록 2개

**기대 결과**:
- 분석 불가 메시지 표시
- "최소 3일, 5개 이상의 기록 필요" 안내
- HTTP 200 + 빈 데이터 (에러 아님)

---

### Scenario 2: 일반 사용자 - 정상 분석
**목적**: 충분한 데이터로 정상 분석

**배경**:
- 가입한 지 30일
- 식사 기록 45개 (1.5끼/일)
- 다양한 시간대, 카테고리

**기대 결과**:
- 시간대별 패턴: "주로 점심(40%), 저녁(35%) 식사"
- 요일별 패턴: "주말에 외식 증가"
- 선호 카테고리: "한식(50%), 일식(20%)"
- 혼밥 비율: 60%

---

### Scenario 3: 활발한 사용자 - 상세 분석
**목적**: 많은 데이터로 고급 인사이트

**배경**:
- 가입한 지 90일
- 식사 기록 180개 (2끼/일)
- 친구 10명
- 평가 기록 다수

**기대 결과**:
- 모든 분석 데이터 완전
- 트렌드 변화 감지 ("최근 외식 증가")
- 친구 기반 추천 가능
- 지출 패턴 명확

---

### Scenario 4: 불규칙한 사용자
**목적**: 패턴이 없는 사용자 처리

**배경**:
- 기록이 불규칙 (2일 연속 후 1주 공백 반복)
- 카테고리 매우 다양
- 가격대 편차 큼

**기대 결과**:
- "불규칙한 식습관" 감지
- 평균값 대신 중앙값 사용
- 신뢰도 낮음 표시

---

### Scenario 5: 친구 추천 - 소셜 기능
**목적**: 친구 데이터 활용

**배경**:
- 친구 5명
- 친구들이 공통으로 좋아하는 식당 있음
- 본인은 아직 미방문

**기대 결과**:
- "친구 3명이 좋아한 OO식당" 추천
- 평점 4.0+ 필터링
- 거리 5km 이내

---

### Scenario 6: 지출 분석 - 예산 초과
**목적**: 지출 경고 알림

**배경**:
- 평소 월 30만원 지출
- 이번 달 이미 25만원 (20일 경과)
- 예상 지출 37.5만원

**기대 결과**:
- "예산 초과 예상" 경고
- "지난달보다 25% 증가" 알림
- 저렴한 식당 추천

---

### Scenario 7: 성능 테스트 - 대량 데이터
**목적**: 많은 데이터 처리 성능

**배경**:
- 365일 데이터 (730개 기록)
- 복잡한 필터링

**기대 결과**:
- 응답 시간 < 500ms
- DB 쿼리 최적화 확인
- 페이지네이션 적용

---

### Scenario 8: 동시 요청 - 부하 테스트
**목적**: 동시 사용자 처리

**배경**:
- 100명 동시 접속
- 각자 패턴 분석 요청

**기대 결과**:
- 모든 요청 성공
- 평균 응답 < 1초
- DB 커넥션 풀 관리

---

## 🧪 테스트 케이스

### 1. 식습관 패턴 분석

#### TC-001: 시간대별 분석 - 정상 케이스
```typescript
describe('Pattern Analysis - Time Distribution', () => {
  it('should analyze meal time distribution correctly', async () => {
    // Given: 사용자 30일 데이터
    const userId = 1;
    const meals = [
      { mealTime: '2024-11-01 08:00', category: '한식' },
      { mealTime: '2024-11-01 12:30', category: '일식' },
      { mealTime: '2024-11-01 19:00', category: '중식' },
      // ... 27일 더
    ];
    
    // When: 패턴 분석 API 호출
    const response = await request(app.getHttpServer())
      .get('/api/ai/analysis/pattern?period=30d')
      .set('Authorization', `Bearer ${validToken}`);
    
    // Then: 시간대별 분포 반환
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      timeDistribution: {
        breakfast: expect.any(Number), // 0-100%
        lunch: expect.any(Number),
        dinner: expect.any(Number),
        lateNight: expect.any(Number),
      },
      totalMeals: 90,
      confidence: expect.any(Number), // 신뢰도
    });
  });
});
```

---

#### TC-002: 데이터 부족 - 에지 케이스
```typescript
it('should return insufficient data message for new users', async () => {
  // Given: 신규 사용자 (기록 2개)
  const userId = 999;
  
  // When: 분석 요청
  const response = await request(app.getHttpServer())
    .get('/api/ai/analysis/pattern')
    .set('Authorization', `Bearer ${newUserToken}`);
  
  // Then: 안내 메시지
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    hasEnoughData: false,
    message: '최소 3일, 5개 이상의 식사 기록이 필요합니다',
    currentMeals: 2,
    requiredMeals: 5,
  });
});
```

---

#### TC-003: 요일별 패턴 - 주말 외식 증가
```typescript
it('should detect weekend eating out pattern', async () => {
  // Given: 주중 집밥, 주말 외식 패턴
  const userId = 1;
  
  // When: 요일별 분석
  const response = await request(app.getHttpServer())
    .get('/api/ai/analysis/pattern?groupBy=weekday');
  
  // Then: 주말 외식 비율 높음
  expect(response.body.weekdayPattern).toEqual({
    weekday: { homeCooked: 70, eatingOut: 30 },
    weekend: { homeCooked: 20, eatingOut: 80 },
  });
});
```

---

#### TC-004: 선호 카테고리 - Top 3
```typescript
it('should return top 3 preferred food categories', async () => {
  // Given: 다양한 카테고리 데이터
  const userId = 1;
  
  // When: 선호 분석
  const response = await request(app.getHttpServer())
    .get('/api/ai/analysis/pattern?include=categories');
  
  // Then: 상위 3개 카테고리
  expect(response.body.preferredCategories).toHaveLength(3);
  expect(response.body.preferredCategories[0]).toMatchObject({
    category: '한식',
    percentage: expect.any(Number),
    count: expect.any(Number),
  });
});
```

---

#### TC-005: 혼밥/회식 비율
```typescript
it('should calculate solo vs group dining ratio', async () => {
  // Given: 혼밥/회식 데이터
  const userId = 1;
  
  // When: 분석
  const response = await request(app.getHttpServer())
    .get('/api/ai/analysis/pattern?include=diningMode');
  
  // Then: 비율 계산
  expect(response.body.diningMode).toMatchObject({
    solo: 60, // 60%
    group: 40, // 40%
  });
});
```

---

### 2. 소비 패턴 분석

#### TC-101: 월별 지출 추이
```typescript
describe('Spending Analysis', () => {
  it('should return monthly spending trend', async () => {
    // Given: 3개월 지출 데이터
    const userId = 1;
    
    // When: 소비 분석
    const response = await request(app.getHttpServer())
      .get('/api/ai/analysis/spending?period=90d');
    
    // Then: 월별 추이
    expect(response.body.monthlyTrend).toHaveLength(3);
    expect(response.body.monthlyTrend[0]).toMatchObject({
      month: '2024-11',
      total: 250000,
      average: 8333, // per meal
      mealCount: 30,
    });
  });
});
```

---

#### TC-102: 가성비 식당 순위
```typescript
it('should rank restaurants by value for money', async () => {
  // Given: 가격/평점 데이터
  const userId = 1;
  
  // When: 가성비 분석
  const response = await request(app.getHttpServer())
    .get('/api/ai/analysis/spending?rankBy=valueForMoney');
  
  // Then: 가성비 순위 (평점/가격)
  expect(response.body.bestValueRestaurants).toHaveLength(10);
  expect(response.body.bestValueRestaurants[0]).toMatchObject({
    restaurantName: expect.any(String),
    averagePrice: expect.any(Number),
    rating: expect.any(Number),
    valueScore: expect.any(Number), // rating / (price/10000)
  });
});
```

---

#### TC-103: 지출 경고 - 예산 초과 예상
```typescript
it('should alert when budget likely to exceed', async () => {
  // Given: 20일에 25만원 지출 (평소 월 30만원)
  const userId = 1;
  const currentDay = 20;
  const currentSpending = 250000;
  const usualMonthly = 300000;
  
  // When: 분석
  const response = await request(app.getHttpServer())
    .get('/api/ai/analysis/spending?alerts=true');
  
  // Then: 초과 경고
  expect(response.body.alerts).toContainEqual({
    type: 'BUDGET_EXCEED',
    severity: 'warning',
    message: '이번 달 예산 초과가 예상됩니다',
    expected: 375000, // (250000/20)*30
    usual: 300000,
    increase: 25, // %
  });
});
```

---

#### TC-104: 트렌드 감지 - 외식비 증가
```typescript
it('should detect spending trend increase', async () => {
  // Given: 지난달 20만원, 이번달 30만원
  const userId = 1;
  
  // When: 트렌드 분석
  const response = await request(app.getHttpServer())
    .get('/api/ai/analysis/spending?trend=true');
  
  // Then: 증가 감지
  expect(response.body.trend).toMatchObject({
    direction: 'increasing',
    percentage: 50,
    message: '지난달 대비 50% 증가',
  });
});
```

---

### 3. 소셜 추천

#### TC-201: 친구가 좋아한 맛집
```typescript
describe('Social Recommendations', () => {
  it('should recommend restaurants friends liked', async () => {
    // Given: 친구 3명이 같은 식당 좋아함
    const userId = 1;
    
    // When: 소셜 추천
    const response = await request(app.getHttpServer())
      .get('/api/ai/recommendations?type=social');
    
    // Then: 친구 추천
    expect(response.body.recommendations).toContainEqual({
      restaurantId: expect.any(Number),
      restaurantName: 'OO식당',
      likedByFriends: [
        { friendId: 2, friendName: '철수', rating: 4.5 },
        { friendId: 3, friendName: '영희', rating: 5.0 },
        { friendId: 4, friendName: '민수', rating: 4.0 },
      ],
      averageRating: 4.5,
      reason: '친구 3명이 좋아한 맛집',
    });
  });
});
```

---

#### TC-202: 동네 인기 맛집 (미방문)
```typescript
it('should recommend popular local restaurants not visited', async () => {
  // Given: 동네에 인기 식당 있지만 미방문
  const userId = 1;
  
  // When: 인기 추천
  const response = await request(app.getHttpServer())
    .get('/api/ai/recommendations?type=popular&radius=2000');
  
  // Then: 미방문 인기 맛집
  expect(response.body.recommendations).toHaveLength(10);
  expect(response.body.recommendations[0]).toMatchObject({
    restaurantId: expect.any(Number),
    restaurantName: expect.any(String),
    visitCount: expect.any(Number), // by all users
    distance: expect.any(Number), // meters
    visited: false, // by current user
    reason: '주변 2km 내 인기 급상승',
  });
});
```

---

#### TC-203: 비슷한 취향 사용자 추천
```typescript
it('should recommend based on similar users', async () => {
  // Given: 비슷한 선호도의 다른 사용자
  const userId = 1;
  
  // When: 협업 필터링 추천
  const response = await request(app.getHttpServer())
    .get('/api/ai/recommendations?type=collaborative');
  
  // Then: 유사 사용자 기반 추천
  expect(response.body.recommendations[0]).toMatchObject({
    restaurantId: expect.any(Number),
    similarUsers: expect.any(Number), // count
    averageRating: expect.any(Number),
    reason: '비슷한 취향의 사용자들이 좋아한 곳',
  });
});
```

---

#### TC-204: 추천 필터 - 거리/가격/평점
```typescript
it('should apply filters to recommendations', async () => {
  // Given: 필터 조건
  const userId = 1;
  
  // When: 필터 적용 추천
  const response = await request(app.getHttpServer())
    .get('/api/ai/recommendations')
    .query({
      maxDistance: 3000, // 3km
      maxPrice: 15000,   // 1.5만원
      minRating: 4.0,
    });
  
  // Then: 필터 통과한 추천만
  response.body.recommendations.forEach((rec: any) => {
    expect(rec.distance).toBeLessThanOrEqual(3000);
    expect(rec.averagePrice).toBeLessThanOrEqual(15000);
    expect(rec.rating).toBeGreaterThanOrEqual(4.0);
  });
});
```

---

### 4. 통합 & 성능 테스트

#### TC-301: 전체 대시보드 API
```typescript
describe('Integration Tests', () => {
  it('should return complete dashboard data', async () => {
    // Given: 충분한 데이터를 가진 사용자
    const userId = 1;
    
    // When: 대시보드 요청
    const response = await request(app.getHttpServer())
      .get('/api/ai/dashboard');
    
    // Then: 모든 분석 데이터 포함
    expect(response.body).toMatchObject({
      pattern: expect.any(Object),
      spending: expect.any(Object),
      recommendations: expect.any(Array),
      insights: expect.any(Array),
    });
    expect(response.status).toBe(200);
  });
});
```

---

#### TC-302: 성능 - 응답 시간 < 500ms
```typescript
it('should respond within 500ms', async () => {
  const userId = 1;
  const startTime = Date.now();
  
  await request(app.getHttpServer())
    .get('/api/ai/analysis/pattern');
  
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(500);
});
```

---

#### TC-303: 성능 - 대량 데이터 (365일)
```typescript
it('should handle 1 year of data efficiently', async () => {
  // Given: 365일, 730개 기록
  const userId = 1;
  
  // When: 분석
  const startTime = Date.now();
  const response = await request(app.getHttpServer())
    .get('/api/ai/analysis/pattern?period=365d');
  
  // Then: 1초 이내
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(1000);
  expect(response.body.totalMeals).toBe(730);
});
```

---

#### TC-304: 동시 요청 - 100명
```typescript
it('should handle 100 concurrent requests', async () => {
  const promises = Array(100).fill(null).map((_, i) => 
    request(app.getHttpServer())
      .get('/api/ai/analysis/pattern')
      .set('Authorization', `Bearer ${tokens[i]}`)
  );
  
  const results = await Promise.all(promises);
  
  results.forEach(res => {
    expect(res.status).toBe(200);
  });
});
```

---

### 5. 에러 처리

#### TC-401: 인증 실패
```typescript
describe('Error Handling', () => {
  it('should return 401 for unauthenticated requests', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ai/analysis/pattern');
    
    expect(response.status).toBe(401);
  });
});
```

---

#### TC-402: 잘못된 파라미터
```typescript
it('should return 400 for invalid period parameter', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/ai/analysis/pattern?period=invalid')
    .set('Authorization', `Bearer ${validToken}`);
  
  expect(response.status).toBe(400);
  expect(response.body.message).toContain('Invalid period');
});
```

---

#### TC-403: DB 연결 실패
```typescript
it('should handle database connection errors gracefully', async () => {
  // Given: DB 다운
  await disconnectDatabase();
  
  // When: 요청
  const response = await request(app.getHttpServer())
    .get('/api/ai/analysis/pattern')
    .set('Authorization', `Bearer ${validToken}`);
  
  // Then: 503 에러
  expect(response.status).toBe(503);
  expect(response.body.message).toContain('Service temporarily unavailable');
});
```

---

## 📊 테스트 커버리지 목표

### Unit Tests
- Services: **90%+**
- Controllers: **80%+**
- DTOs: **100%**

### Integration Tests
- API Endpoints: **100%**
- DB Queries: **90%+**

### E2E Tests
- User Scenarios: **8개 모두**
- Critical Paths: **100%**

---

## 🚀 테스트 실행 방법

### 전체 테스트
```bash
npm test
```

### 특정 모듈
```bash
npm test -- ai.service.spec.ts
```

### 커버리지
```bash
npm run test:cov
```

### E2E
```bash
npm run test:e2e
```

---

## 📝 테스트 데이터 Fixture

### fixtures/users.fixture.ts
```typescript
export const testUsers = {
  newUser: {
    id: 999,
    username: 'newbie',
    mealCount: 2,
    createdAt: new Date('2024-11-26'),
  },
  regularUser: {
    id: 1,
    username: 'john',
    mealCount: 45,
    createdAt: new Date('2024-10-01'),
  },
  powerUser: {
    id: 2,
    username: 'jane',
    mealCount: 180,
    createdAt: new Date('2024-08-01'),
  },
};
```

### fixtures/meals.fixture.ts
```typescript
export const testMeals = {
  breakfast: (userId: number, date: Date) => ({
    userId,
    mealTime: new Date(date.setHours(8, 0)),
    category: '한식',
    price: 8000,
  }),
  // ... lunch, dinner, lateNight
};
```

---

**마지막 업데이트**: 2025-11-27  
**다음 단계**: AI 모듈 구현 시작
