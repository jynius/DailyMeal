# DailyMeal 초기 설정 가이드

프로젝트를 처음 시작할 때 데이터가 전혀 없는 상태에서의 설정 방법입니다.

## 🚀 빠른 시작 (데이터 없는 상태)

### 1. 데이터베이스 초기화

```bash
# PostgreSQL 데이터베이스 생성 및 테이블 생성
cd backend
npm run typeorm migration:run  # 또는 synchronize: true로 자동 생성
```

### 2. 시드 데이터 투입 ⭐️

**AI 추천 기능을 위해 필수!** 초기 샘플 데이터를 넣어야 빈 화면이 나오지 않습니다.

```bash
cd backend
node scripts/seed-initial-data.js
```

**투입되는 데이터:**
- 데모 사용자 2명 (demo@dailymeal.com, test@dailymeal.com)
- 샘플 맛집 기록 15개 (다양한 카테고리: 한식, 중식, 일식, 양식, 카페, 패스트푸드)
- 친구 관계 1개 (데모 ↔ 테스트)

### 3. 서버 실행

```bash
# 루트 디렉토리에서
npm run dev:pm2

# 또는
npm run dev
```

### 4. 데모 계정으로 로그인

```
이메일: demo@dailymeal.com
비밀번호: demo1234
```

---

## 🔍 데이터 없을 때 동작 방식

### ✅ 구현된 Cold Start 대응

1. **사용자 개인 데이터 없을 때**
   - AI 추천: 자동으로 전체 사용자의 인기 맛집 표시 (Fallback)
   - 패턴 분석: "데이터가 부족합니다" 안내 메시지
   - 지출 분석: "데이터가 부족합니다" 안내 메시지

2. **전체 시스템에 데이터 없을 때**
   - AI 추천: 빈 배열 반환 (프론트엔드에서 "추천이 없습니다" 표시)
   - 해결책: **시드 데이터 투입** (위의 2번 단계)

### 📝 Onboarding 설문 (옵션)

데이터 없는 신규 사용자를 위한 선호도 설문이 준비되어 있습니다:

- 위치: `frontend/src/components/ai/OnboardingQuestionnaire.tsx`
- 통합 방법: `docs/features/AI_COLD_START_EXAMPLES.md` 참고

```tsx
// 홈 페이지에 통합 예시
import OnboardingQuestionnaire from '@/components/ai/OnboardingQuestionnaire'

{!hasData && <OnboardingQuestionnaire onComplete={handleComplete} />}
```

---

## 🛠️ 개발 시나리오별 가이드

### Scenario 1: 완전히 빈 DB로 시작

```bash
# 1. DB 초기화
psql -U postgres -c "DROP DATABASE dailymeal;"
psql -U postgres -c "CREATE DATABASE dailymeal;"

# 2. 테이블 생성 (TypeORM synchronize)
cd backend && npm run dev  # synchronize: true 설정 필요

# 3. 시드 데이터 투입
node scripts/seed-initial-data.js
```

### Scenario 2: 신규 사용자 가입

**자동 처리됨!**
- UserSettings 자동 생성 (defaults 적용)
- AI 추천 기본 설정: social, 5km, 평점 4.0+
- 식사 기록 없어도 Fallback으로 인기 맛집 표시

### Scenario 3: 프로덕션 배포 (빈 상태)

```bash
# 1. DB 마이그레이션
npm run typeorm migration:run

# 2. 시드 데이터 (선택)
NODE_ENV=production node scripts/seed-initial-data.js

# 3. 또는 실제 사용자 데이터 기다리기
# - 첫 사용자들이 데이터를 쌓으면 자동으로 AI 추천 작동
# - 10-20개 정도 기록 생성 시 추천 품질 향상
```

---

## 🎯 AI 추천이 작동하려면

### 최소 데이터 요구사항

| 기능 | 최소 요구사항 | 권장 데이터 |
|------|--------------|------------|
| **Social 추천** | 친구 1명 이상, 친구의 평점 4+ 기록 1개 | 친구 3명, 각 5개 이상 |
| **Popular 추천** | 전체 사용자의 같은 맛집 방문 2회 이상 | 10개 이상 맛집, 각 3회+ |
| **Collaborative** | 취향 유사 사용자 1명 (공통 맛집 2개+) | 10명 이상 활성 사용자 |
| **Fallback** | 전체 사용자의 평점 4+ 기록 2개 이상 | 20개 이상 고평점 맛집 |

### 시드 데이터로 커버되는 범위

✅ Popular 추천: 동일 맛집 2회 방문 데이터 제공
✅ Fallback: 평점 4-5점 맛집 15개 제공
⚠️ Social: 친구 관계 1개 (최소한)
⚠️ Collaborative: 사용자 2명 (최소한)

---

## 🐛 트러블슈팅

### "AI 추천이 비어있어요"

1. **시드 데이터 확인**
   ```sql
   SELECT COUNT(*) FROM meal_records;  -- 최소 10개 이상
   SELECT COUNT(*) FROM users;         -- 최소 2명 이상
   ```

2. **평점 높은 기록 확인**
   ```sql
   SELECT location, COUNT(*), AVG(rating) 
   FROM meal_records 
   WHERE location IS NOT NULL 
   GROUP BY location 
   HAVING AVG(rating) >= 4 AND COUNT(*) >= 2;
   ```

3. **시드 데이터 재투입**
   ```bash
   node scripts/seed-initial-data.js
   ```

### "친구 추천이 안 나와요"

- 최소 1명의 친구 필요 (status: 'accepted')
- 친구가 평점 4점 이상 준 맛집 필요
- 시드 데이터는 demo ↔ test 친구 관계 제공

### "협업 필터링이 안돼요"

- 최소 2명 이상 사용자 필요
- 공통으로 방문한 맛집 2개 이상 필요
- 실사용 후 데이터 축적 필요

---

## 📚 관련 문서

- **AI 추천 시스템**: `docs/features/AI_PHASE1_DEVELOPMENT_PLAN.md`
- **Cold Start 예제**: `docs/features/AI_COLD_START_EXAMPLES.md`
- **Onboarding 가이드**: `frontend/src/components/ai/OnboardingQuestionnaire.tsx`

---

**Last Updated**: 2025-01-27  
**초기 데이터 투입 소요 시간**: ~5초  
**권장 최소 사용자**: 2명 (시드 데이터 포함)
