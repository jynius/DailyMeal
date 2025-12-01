# AI Phase 1 개발 로드맵

**작성일**: 2025-11-27  
**목표**: 식습관 분석 & 추천 기능 (외부 API 비용 $0)  
**기간**: 2-3주

---

## 📋 구현 기능

### 1. 식습관 패턴 분석
- 시간대별 식사 빈도
- 요일별 식습관
- 선호 음식 카테고리
- 혼밥/회식 비율

### 2. 소비 패턴 분석
- 월별 외식비 추이
- 평균 식사 단가
- 가성비 식당 순위
- 지출 경고 알림

### 3. 소셜 추천
- 친구가 좋아한 맛집
- 동네 인기 맛집
- 안 가본 맛집 추천

---

## 🏗️ 아키텍처

```
backend/src/
├── ai/
│   ├── ai.module.ts
│   ├── ai.controller.ts
│   ├── dto/
│   │   ├── pattern-analysis.dto.ts
│   │   ├── spending-analysis.dto.ts
│   │   └── recommendation.dto.ts
│   ├── analysis/
│   │   ├── pattern-analysis.service.ts
│   │   ├── spending-analysis.service.ts
│   │   └── insight.service.ts
│   └── recommendation/
│       ├── social-recommendation.service.ts
│       └── restaurant-recommendation.service.ts
```

---

## 📅 개발 일정

### Week 1: 기본 구조 + 패턴 분석 (5일)

**Day 1-2**: 프로젝트 구조 설정
- [ ] `ai` 모듈 생성
- [ ] DTOs 정의
- [ ] 기본 컨트롤러 설정
- [ ] 테스트 환경 구축

**Day 3-4**: 식습관 패턴 분석
- [ ] 시간대별 식사 빈도 분석
- [ ] 요일별 패턴 분석
- [ ] 선호 카테고리 분석
- [ ] 혼밥/회식 비율

**Day 5**: 통합 테스트 & 버그 수정
- [ ] Unit 테스트
- [ ] Integration 테스트
- [ ] API 문서화 (Swagger)

### Week 2: 소비 분석 + 소셜 추천 (5일)

**Day 6-7**: 소비 패턴 분석
- [ ] 월별 지출 통계
- [ ] 가성비 순위
- [ ] 지출 트렌드 분석
- [ ] 경고 알림 로직

**Day 8-9**: 소셜 추천
- [ ] 친구 맛집 추천
- [ ] 동네 인기 맛집
- [ ] 미방문 맛집 필터링
- [ ] 추천 알고리즘 최적화

**Day 10**: 통합 테스트
- [ ] E2E 테스트
- [ ] 성능 테스트
- [ ] API 문서 완성

### Week 3: Frontend 연동 + 배포 (5일)

**Day 11-12**: Frontend 대시보드
- [ ] 패턴 분석 UI
- [ ] 소비 분석 차트
- [ ] 추천 목록 UI

**Day 13-14**: 최적화 & 버그 수정
- [ ] 쿼리 최적화
- [ ] 캐싱 적용
- [ ] 에러 처리

**Day 15**: 배포 & 모니터링
- [ ] PM2 배포
- [ ] 로그 모니터링 설정
- [ ] 베타 테스트 시작

---

## 🔧 기술 스택

**Backend**:
- NestJS 11
- TypeORM
- PostgreSQL
- Class-validator

**분석**:
- SQL 집계 쿼리
- TypeScript 통계 로직
- 캐싱 (메모리)

**테스트**:
- Jest
- Supertest (E2E)

---

## 📊 성공 지표

### 기능 완성도
- [ ] 모든 API 엔드포인트 작동
- [ ] 테스트 커버리지 80%+
- [ ] Swagger 문서 완성

### 성능
- [ ] API 응답 시간 < 500ms
- [ ] DB 쿼리 최적화 (EXPLAIN 확인)
- [ ] 동시 사용자 100명 처리 가능

### 사용자 경험
- [ ] 베타 테스터 5명+ 피드백
- [ ] UI/UX 개선 사항 수집
- [ ] 버그 리포트 0건

---

## 🚨 리스크 관리

### 데이터 부족
**문제**: 신규 사용자는 분석할 데이터 없음  
**해결**: 
- 최소 3일 데이터 필요 안내
- 샘플 데이터 표시 (튜토리얼)

### 성능 이슈
**문제**: 복잡한 집계 쿼리로 DB 부하  
**해결**: 
- 인덱스 최적화
- 결과 캐싱 (1시간)
- 비동기 처리 (무거운 분석)

### 정확도
**문제**: 데이터가 적으면 분석 부정확  
**해결**: 
- 신뢰도 점수 표시
- "더 많은 데이터가 필요해요" 안내

---

## 📝 API 엔드포인트 (예정)

### 패턴 분석
```
GET /api/ai/analysis/pattern
- 시간대별, 요일별 패턴
- 선호 카테고리
- 혼밥/회식 비율

Query Params:
- period: 7d | 30d | 90d (기본: 30d)
```

### 소비 분석
```
GET /api/ai/analysis/spending
- 월별 지출
- 가성비 순위
- 트렌드 분석

Query Params:
- period: 30d | 90d | 1y (기본: 30d)
```

### 추천
```
GET /api/ai/recommendations
- 친구 맛집
- 동네 인기
- 미방문 맛집

Query Params:
- type: social | popular | new
- limit: 10 (기본)
```

---

## 🎯 Phase 2 준비 사항

**데이터 수집**:
- Phase 1에서 사용자 반응 수집
- 어떤 분석이 가장 유용한지 파악

**아키텍처**:
- OpenAI API 추가할 모듈 구조 유지
- Config에 `OPENAI_API_KEY` 준비

**비용**:
- Phase 1 성공 시 Phase 2 예산 확보
- OpenAI API 사용량 모니터링 계획

---

**마지막 업데이트**: 2025-11-27  
**다음 문서**: Phase 1 테스트 시나리오 & 케이스
