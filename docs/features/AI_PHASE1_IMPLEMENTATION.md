# AI Features - Phase 1 Implementation

## 📊 Overview

DailyMeal의 AI 기능 Phase 1이 구현되었습니다. 사용자의 식사 기록을 분석하여 패턴을 파악하고, 지출을 추적하며, 맞춤 맛집을 추천합니다.

**비용**: $0/월 (외부 API 없음, 자체 알고리즘)

## 🎯 Features

### 1. 식사 패턴 분석 (Pattern Analysis)
- **시간대별 분포**: 아침/점심/저녁/야식 비율 분석
- **요일별 패턴**: 요일별 식사 횟수 시각화
- **식사 유형**: 집밥/배달/외식 비율
- **동반자 분석**: 혼자 vs 친구와 함께

### 2. 지출 분석 (Spending Analysis)
- **월별 트렌드**: 지출 추이 및 변화율
- **가성비 맛집**: 평점 대비 가격이 합리적인 맛집 TOP 5
- **지출 알림**: 비정상적인 지출 패턴 감지
- **평균 계산**: 끼니당 평균 지출

### 3. 맛집 추천 (Recommendations)
- **소셜 추천**: 친구들이 좋아한 맛집
- **인기 맛집**: 방문 횟수가 많은 식당
- **취향 기반**: 비슷한 취향을 가진 사용자들의 선택

## 🏗️ Architecture

```
Backend (NestJS)
├── /src/ai/
│   ├── ai.module.ts
│   ├── ai.controller.ts
│   ├── dto/
│   │   ├── pattern-analysis.dto.ts
│   │   ├── spending-analysis.dto.ts
│   │   └── recommendation.dto.ts
│   ├── analysis/
│   │   ├── pattern-analysis.service.ts
│   │   └── spending-analysis.service.ts
│   └── recommendation/
│        └── recommendation.service.ts
└── test files (19 tests)

Frontend (Next.js)
├── /src/lib/api/ai.ts
├── /src/hooks/use-ai.ts
├── /src/components/ai/
│   ├── PatternAnalysisCard
│   ├── SpendingAnalysisCard
│   └── RecommendationsCard
└── /src/app/(main)/
     └── ai-insights/
           └── page.tsx
```

## 📡 API Endpoints

### Pattern Analysis
```
GET /api/ai/analysis/pattern?period={week|month|quarter|year}
```

### Spending Analysis
```
GET /api/ai/analysis/spending?period={month|quarter|year}
```

### Recommendations
```
GET /api/ai/recommendations?type={social|popular|collaborative}&maxDistance=5000&excludeVisited=true
```

## 🧪 Testing

```bash
# Backend tests (19 tests)
cd backend
npm test -- ai

# Results:
# ✅ PatternAnalysisService: 4 tests
# ✅ SpendingAnalysisService: 6 tests
# ✅ RecommendationService: 8 tests
# ✅ AppController: 1 test
```

## 🚀 Usage

### Frontend Hook Example

```typescript
import { usePatternAnalysis, useSpendingAnalysis, useRecommendations } from '@/hooks/use-ai'
import { AnalysisPeriod, SpendingPeriod, RecommendationType } from '@/lib/api'

function MyComponent() {
  const { data: pattern } = usePatternAnalysis(AnalysisPeriod.MONTH)
  const { data: spending } = useSpendingAnalysis(SpendingPeriod.MONTH)
  const { data: recommendations } = useRecommendations(
    RecommendationType.SOCIAL,
    { excludeVisited: true, maxDistance: 5000 }
  )

  // Use data...
}
```

### Direct API Call Example

```typescript
import { aiApi, AnalysisPeriod } from '@/lib/api'

const pattern = await aiApi.getPatternAnalysis(AnalysisPeriod.MONTH)
const spending = await aiApi.getSpendingAnalysis(SpendingPeriod.QUARTER)
const recommendations = await aiApi.getRecommendations(RecommendationType.POPULAR)
```

## 🔍 Access

1. **Web**: 프로필 → AI 인사이트
2. **URL**: http://localhost:3000/ai-insights
3. **Swagger**: http://localhost:8000/api-docs → AI 섹션

## 📊 Data Requirements

- **최소 데이터**: 3개 이상의 식사 기록 권장
- **추천 정확도**: 식사 기록이 많을수록 향상
- **친구 추천**: 친구 관계 및 공유 기록 필요

## 🎨 UI Components

### PatternAnalysisCard
- 시간대별 식사 분포 (Progress bars)
- 요일별 패턴 (Bar chart)
- 카테고리별 분포 (Icon + Progress bars)
- 동반자 통계 (Grid cards)

### SpendingAnalysisCard
- 총 지출 / 평균 지출 (Summary cards)
- 지출 추세 (Trend indicator)
- 월별 지출 추이 (Horizontal bars)
- 가성비 맛집 TOP 5 (List cards)
- 지출 알림 (Alert badges)

### RecommendationsCard
- 추천 맛집 리스트 (Cards)
- 평점 / 가격 / 거리 정보
- 친구 추천 정보 (Friend badges)
- 방문 여부 표시

## 🔮 Phase 2 Preview

Phase 2에서 추가될 기능 (외부 API 연동):

1. **OpenAI Vision API**
   - 음식 사진 자동 인식
   - 음식명 추천
   - 예상 가격 제안

2. **Google Gemini API**
   - 칼로리 계산
   - 영양 성분 분석
   - 건강 지표 추적

3. **카카오 로컬 검색 API**
   - 실시간 맛집 정보
   - 영업시간 / 메뉴 정보
   - 리뷰 통합

**예상 비용**: 월 $10-30

## 📝 Notes

- Phase 1은 완전히 자체 알고리즘으로 동작하여 비용이 발생하지 않습니다
- TypeScript 타입 안정성 100% 확보
- React Query 캐싱으로 API 호출 최소화
- 모바일 반응형 UI 지원

## 🐛 Known Issues

없음 - 모든 테스트 통과 (19/19)

## 📚 Related Documentation

- `/docs/AI_FEATURES_ROADMAP.md` - 전체 AI 기능 로드맵
- `/docs/AI_PHASE1_DEVELOPMENT_PLAN.md` - Phase 1 개발 계획
- `/docs/AI_PHASE1_TEST_SCENARIOS.md` - 테스트 시나리오
- `/frontend/src/lib/api/README.md` - API 클라이언트 가이드

---

**Last Updated**: 2025-11-27  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
