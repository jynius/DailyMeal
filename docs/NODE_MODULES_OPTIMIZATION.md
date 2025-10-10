# Node Modules 중복 및 최적화 가이드

## 📊 현재 상황 분석

### Node Modules 위치
```
DailyMeal/
├── node_modules/              # 루트 (54MB) ❌ 불필요
├── frontend/node_modules/     # 프론트엔드 (568MB) ✅ 필요
├── backend/node_modules/      # 백엔드 (필요 용량) ✅ 필요
└── app/node_modules/          # React Native 앱 ✅ 필요
```

---

## ❓ 자주 묻는 질문

### Q1: 각 폴더마다 node_modules가 있는 게 맞나요?
**A: 네, 맞습니다!** 

이유:
- **Frontend**: Next.js, React 관련 패키지
- **Backend**: NestJS, TypeORM, PostgreSQL 드라이버
- **App**: Expo, React Native 패키지
- 각각 다른 의존성을 가지므로 **분리가 필수**입니다.

### Q2: 한 곳에서 설치해서 공유할 수 없나요?
**A: 이론적으로 가능하지만 권장하지 않습니다.**

#### Monorepo + Workspaces 방식 (가능)
```json
// 루트 package.json
{
  "workspaces": [
    "frontend",
    "backend",
    "app"
  ]
}
```

**장점:**
- ✅ 공통 패키지 중복 제거
- ✅ 일괄 업데이트 가능
- ✅ 약간의 용량 절약

**단점:**
- ❌ 복잡한 설정
- ❌ 배포 시 문제 발생 가능
- ❌ 각 프로젝트 독립성 상실
- ❌ PM2, Docker 등 배포 도구와 충돌

### Q3: 중복되는 패키지가 있나요?
**A: 네, 일부 있습니다.**

공통으로 사용될 수 있는 패키지:
- `typescript` (모두 사용)
- `eslint` 관련 패키지
- 일부 유틸리티 패키지

하지만 **버전이 다르거나 용도가 다를 수 있습니다.**

---

## 🔍 중복 패키지 분석

### 현재 중복 확인
```bash
# Frontend의 주요 패키지
cd ~/DailyMeal/frontend
du -sh node_modules/* | sort -hr | head -20

# Backend의 주요 패키지
cd ~/DailyMeal/backend
du -sh node_modules/* | sort -hr | head -20
```

### 예상 중복 (추정)
- TypeScript: ~50MB (frontend, backend, app)
- ESLint: ~30MB (frontend, backend)
- 기타 유틸리티: ~20MB

**절약 가능 용량: 최대 100MB** (전체의 10% 미만)

---

## 💡 권장 최적화 방법

### 1. 루트 node_modules 제거 ⭐ (즉시 가능)
```bash
# 루트 node_modules는 불필요
cd ~/DailyMeal
rm -rf node_modules package-lock.json

# 54MB 확보!
```

**이유**: 각 서브 프로젝트가 독립적으로 의존성을 관리하므로 루트는 필요 없음.

### 2. Production 빌드 후 devDependencies 제거
```bash
# Backend (프로덕션 환경)
cd ~/DailyMeal/backend
npm prune --production

# Frontend는 빌드 완료 후 node_modules 최소화
cd ~/DailyMeal/frontend
npm prune --production
```

**주의**: 빌드가 완료된 상태에서만!

### 3. .npmrc 설정으로 용량 절약
```bash
# 각 프로젝트에 .npmrc 추가
echo "prefer-offline=true" >> frontend/.npmrc
echo "prefer-offline=true" >> backend/.npmrc
echo "prefer-offline=true" >> app/.npmrc
```

### 4. 불필요한 패키지 제거
```bash
# 사용하지 않는 패키지 찾기
npx depcheck
```

---

## 🚀 Monorepo 방식 (선택적, 고급)

### 장단점 비교

| 항목 | 현재 방식 | Monorepo |
|------|----------|----------|
| 설정 복잡도 | 간단 ⭐ | 복잡 |
| 용량 | 중간 | 약간 적음 (-10%) |
| 배포 | 간단 ⭐ | 복잡 |
| 독립성 | 높음 ⭐ | 낮음 |
| 유지보수 | 쉬움 ⭐ | 어려움 |

### Monorepo 도입 시기
다음 경우에만 고려:
- ✅ 팀이 5명 이상
- ✅ 패키지 간 의존성이 매우 많음
- ✅ 동시 업데이트가 빈번함
- ✅ 전담 DevOps 엔지니어 있음

**현재 프로젝트**: 도입 **비추천** ❌

---

## 📦 각 프로젝트별 node_modules 분석

### Frontend (568MB)
주요 패키지:
- Next.js: ~150MB
- React: ~10MB
- TailwindCSS: ~50MB
- Socket.io: ~30MB
- 기타 의존성: ~328MB

**최적화**: 
```bash
# Production 빌드 후
npm prune --production
# → 약 100MB 절약 가능
```

### Backend (357MB)
주요 패키지:
- NestJS: ~80MB
- TypeORM: ~20MB
- PostgreSQL driver: ~10MB
- 기타 의존성: ~247MB

**최적화**:
```bash
# Production 환경
npm install --production
# → 약 80MB 절약 가능
```

### App (React Native)
주요 패키지:
- Expo: ~200MB
- React Native: ~100MB
- 기타 의존성: ~100MB

**최적화**: 어려움 (Expo는 많은 의존성 필요)

---

## ✅ 즉시 실행 가능한 최적화

### 1단계: 루트 정리 (54MB 확보)
```bash
cd ~/DailyMeal
rm -rf node_modules package-lock.json
```

### 2단계: 빌드 후 Production 설치
```bash
# Backend (빌드 완료 확인 후)
cd backend
npm prune --production

# Frontend (빌드 완료 확인 후)
cd frontend
npm prune --production
```

### 3단계: npm 캐시 정리
```bash
npm cache clean --force
```

**예상 절약: 150-250MB** 🎉

---

## 🎯 결론

### 현재 방식 유지 권장 ⭐

**이유:**
1. ✅ 각 프로젝트가 독립적 (배포 간단)
2. ✅ 복잡도 낮음 (유지보수 쉬움)
3. ✅ 중복 제거 효과 미미 (~10%)
4. ✅ Monorepo 도입 시 리스크 > 이득

### 최적화 우선순위
1. **루트 node_modules 삭제** (54MB) ← 즉시
2. **npm 캐시 정리** (100MB) ← 즉시
3. **Production 빌드 최적화** (180MB) ← 배포 시
4. ~~Monorepo 도입~~ (100MB) ← 비추천

### 근본적 해결책
- **EBS 볼륨 확장** (7GB → 15GB 이상) ← 권장 ⭐
- 비용: 월 $1-2 추가 (GB당 $0.10)

---

## 📚 참고 자료

- [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Monorepo 도구 비교](https://monorepo.tools/)
- [Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/)
- [pnpm (효율적인 패키지 매니저)](https://pnpm.io/)

---

**작성일**: 2025-10-10
**권장**: 현재 구조 유지 + 루트 정리
**미래**: EBS 볼륨 확장
