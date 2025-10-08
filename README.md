# DailyMeal 🍽️

매일의 식사를 기록하고 음식점을 공유하는 소셜 식단 플랫폼

## ✨ 주요 기능

### 📱 **개인 식사 기록**
- 📸 **사진 기반 식사 기록**: 음식 사진과 함께## 🚀 서버 배포 가이드

### 빠른 배포 (권장)
```bash
# 1. 저장소 클론
git clone https://github.com/jynius/DailyMeal.git
cd DailyMeal

# 2. 간단 배포 스크립트 실행
./deploy-simple.sh
```

### 수동 배포
```bash
# 1. 의존성 설치
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. 빌드
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..

# 3. PM2로 실행
pm2 start ecosystem.config.js
```

### 개발 모드 실행
```bash
# PM2 개발 모드
pm2 start ecosystem.dev.config.js

# 또는 개별 실행
cd backend && npm run start:dev &
cd frontend && npm run dev &
```

### 트러블슈팅
- **"Could not find a production build"**: `npm run build`를 먼저 실행하세요
- **PM2 재시작 루프**: `pm2 logs`로 오류 확인 후 `pm2 restart all`
- **포트 충돌**: PM2 설정에서 PORT 환경변수 수정

## 📞 문의 및 지원

- **GitHub Issues**: [버그 리포트 및 기능 요청](https://github.com/jynius/DailyMeal/issues)
- **개발자**: [@jynius](https://github.com/jynius)정보 기록
- ⭐ **별점 평가 시스템**: 1-5점 별점으로 음식 평가
- 📍 **위치 정보**: 식사 장소 기록
- 💰 **가격 기록**: 음식 가격 정보 저장
- 📝 **메모 기능**: 간단한 후기나 메모 작성

### 🗺️ **음식점 공유 & 맵**
- 🏪 **음식점 데이터베이스**: 개별## 🔧 개발 참고사항

### 📋 브랜치 전략
| 브랜치 | 환경 | 자동 배포 | 용도 |
|--------|------|-----------|------|
| **`main`** | 🔧 개발 | ❌ | 소스 코드 관리, 기본 개발 브랜치 |
| **`dev`** | 🧪 스테이징 | ✅ | 테스트 서버 자동 배포 |

### 🛠️ 개발 도구 설정
```bash
# ESLint + Prettier 설정 완료
# TypeScript 엄격 모드 활성화  
# Next.js 15 호환성 검증

# VS Code 권장 확장:
# - TypeScript + JavaScript
# - Tailwind CSS IntelliSense
# - ESLint + Prettier
```

### 📊 프로젝트 메트릭스 (현재)
- **총 라인수**: ~3,000+ lines
- **컴포넌트**: 15+ 개 재사용 컴포넌트
- **페이지**: 11개 라우트 (SSG 7개 + Dynamic 4개)
- **API 엔드포인트**: 15+ 개
- **번들 크기**: 153kB (First Load JS)
- **빌드 시간**: ~5-10초 (Turbopack)

## 🚀 향후 개선 계획

### 🎯 단기 목표 (v1.1)
- [ ] **PWA 지원**: 오프라인 기능, 푸시 알림
- [ ] **실시간 기능**: Socket.io로 실시간 댓글/좋아요
- [ ] **지도 API 연동**: Kakao Map / Google Maps
- [ ] **이미지 최적화**: 썸네일 생성, CDN 연동

### 🔮 중기 목표 (v1.5)
- [ ] **소셜 로그인**: Google, Kakao, Naver 연동
- [ ] **팔로우 시스템**: 친구 맺기, 피드 구독
- [ ] **추천 알고리즘**: 개인 취향 기반 음식점 추천
- [ ] **데이터 분석**: 대시보드, 인사이트 제공

### 🌟 장기 비전 (v2.0)
- [ ] **Multi-tenant**: 여러 지역/그룹 지원
- [ ] **모바일 앱**: React Native / Flutter
- [ ] **AI 기능**: 음식 인식, 자동 태깅
- [ ] **마이크로서비스**: 확장 가능한 아키텍처

## 🤝 기여 방법

### 🔧 개발 환경 설정
1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/DailyMeal.git
   cd DailyMeal
   ```

2. **브랜치 생성**
   ```bash
   git checkout -b feature/새기능명
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **커밋 규칙**
   ```bash
   git commit -m "feat: 새로운 기능 추가"
   # feat: 새 기능
   # fix: 버그 수정  
   # docs: 문서 수정
   # style: 코드 포맷팅
   # refactor: 코드 리팩토링
   ```

### 🐛 이슈 리포트
- **버그**: 재현 단계와 환경 정보 포함
- **기능 요청**: 사용 시나리오와 예상 동작 설명
- **질문**: 구체적인 상황과 시도한 방법 포함

## � 최근 해결된 이슈들

### 2025.10.08 - 안정성 및 호환성 개선
- ✅ **Bus Error 해결**: Next.js 15.5.4 → 14.2.13, React 19.1.0 → 18.3.1 다운그레이드로 서버 환경 호환성 확보
- ✅ **404 오류 해결**: 전체 사이트 접근 불가 문제 해결
- ✅ **Socket.IO 안정화**: CORS 설정 개선 및 연결 로직 단순화
- ✅ **TailwindCSS 호환성**: v4 → v3.4.15 다운그레이드로 빌드 안정성 확보
- ✅ **ES Module 설정**: PostCSS 및 Next.js 설정 파일 ES Module 형식으로 통일
- ✅ **PM2 안정성**: 프로세스 재시작 횟수 대폭 감소 (116회 → 35회)

### 성능 및 안정성 지표
```
현재 PM2 상태:
├─ 백엔드: 13회 재시작, 57.3MB 메모리 사용
├─ 프론트엔드: 35회 재시작, 25.8MB 메모리 사용  
└─ 서비스: 모든 엔드포인트 정상 응답 (200 OK)
```

## �📞 문의 및 지원

- **GitHub Issues**: [버그 리포트 및 기능 요청](https://github.com/jynius/DailyMeal/issues)
- **개발자**: [@jynius](https://github.com/jynius)
- **프로젝트 위키**: [상세 문서](https://github.com/jynius/DailyMeal/wiki)

---

## 🙏 감사 인사

이 프로젝트는 다음 오픈소스 도구들로 만들어졌습니다:

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeORM, SQLite
- **DevOps**: PM2, GitHub Actions
- **UI**: Radix UI, Lucide Icons

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!**보 관리
- �️ **음식점 맵 생성**: 여러 음식점을 하나의 테마로 묶어 지도 생성
- 🔗 **소셜 공유**: 개별 음식점과 맵을 SNS로 공유
- 📍 **위치 기반 탐색**: 주변 음식점 및 맵 탐색

### �🔍 **검색 & 발견**
- 🔎 **통합 검색**: 메뉴, 장소, 메모 내용 검색
- 📊 **통계 보기**: 총 기록 수, 평균 별점, 방문 장소 수
- 🏷️ **카테고리 필터**: 음식 종류별 필터링

## 🏗️ 프로젝트 구조 (모노레포)

```
/
├── frontend/              # Next.js 15 + TypeScript + Tailwind CSS
│   ├── src/app/           # App Router 페이지들
│   │   ├── page.tsx       # 메인 피드 페이지
│   │   ├── add/           # 식사 기록 추가
│   │   ├── feed/          # 식사 피드
│   │   ├── search/        # 통합 검색
│   │   ├── profile/       # 사용자 프로필
│   │   └── restaurants/   # 음식점 관련
│   │       ├── page.tsx   # 음식점 목록
│   │       ├── [id]/      # 개별 음식점 상세
│   │       ├── map/create/# 음식점 맵 생성
│   │       └── maps/[id]/ # 음식점 맵 상세
│   ├── src/components/    # 재사용 가능한 컴포넌트들
│   │   ├── ui/            # 기본 UI 컴포넌트
│   │   ├── auth/          # 인증 관련 컴포넌트
│   │   ├── meal-card.tsx  # 식사 기록 카드
│   │   ├── share-modal.tsx# 소셜 공유 모달
│   │   └── bottom-navigation.tsx # 하단 네비게이션
│   ├── src/lib/           # 유틸리티 함수 및 API 클라이언트
│   │   ├── api/           # API 클라이언트
│   │   └── share-utils.ts # 소셜 공유 유틸리티
│   └── src/types/         # TypeScript 타입 정의
│
├── backend/               # NestJS + TypeScript + SQLite
│   ├── src/entities/      # TypeORM 엔티티 정의
│   │   ├── meal-record.entity.ts
│   │   └── user.entity.ts
│   ├── src/dto/           # 데이터 전송 객체
│   ├── src/auth/          # JWT 인증 모듈
│   ├── src/meal-records/  # 식사 기록 CRUD
│   ├── src/common/        # 공통 서비스 (로깅 등)
│   ├── data/              # SQLite 데이터베이스
│   ├── logs/              # 애플리케이션 로그
│   └── uploads/           # 업로드된 이미지 파일
│
├── .github/workflows/     # GitHub Actions CI/CD
├── deploy.sh              # 스마트 배포 스크립트
└── package.json           # 루트 패키지 관리
```

## 🚀 개발 서버 실행

### 1. 프론트엔드 (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- 실행 주소: http://localhost:3000

### 2. 백엔드 (NestJS)  
```bash
cd backend
npm install
npm run start:dev
```
- 실행 주소: http://localhost:8000
- API 문서: http://localhost:8000/api-docs

### 3. PM2로 전체 실행 (권장)
```bash
# PM2 개발 환경 실행
npm run pm2:dev

# PM2 상태 확인
npm run pm2:status

# PM2 중지
npm run pm2:stop
```

## 🔧 기술 스택

### Frontend (최신 기술 적용)
- **Framework**: Next.js 15.5.4 (App Router + Turbopack)
- **Language**: TypeScript 5+ 
- **Rendering**: Hybrid (SSG + SSR + CSR)
- **Styling**: Tailwind CSS 4+ (PostCSS)
- **UI Components**: Radix UI + Lucide Icons + CVA
- **State Management**: Zustand + React Query (TanStack)
- **API Client**: 타입 안전 Fetch wrapper
- **Performance**: Next.js Image 최적화, Code Splitting

### Backend (확장 가능한 아키텍처)
- **Framework**: NestJS (Enterprise-grade)
- **Language**: TypeScript
- **Database**: SQLite (개발) / PostgreSQL (프로덕션 대응)
- **ORM**: TypeORM (관계형 매핑)
- **Authentication**: JWT + Passport Strategy
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI 3.0
- **File Upload**: Multer (이미지 처리)
- **Logging**: Winston (구조화된 로깅)

### DevOps & 배포 (자동화 & 최적화)
- **프로세스 관리**: PM2 (메모리 제한, 자동 재시작)
- **CI/CD**: GitHub Actions (자동 배포)
- **배포 최적화**: 스마트 의존성 관리, 리소스 모니터링
- **웹 서버**: Nginx (리버스 프록시, 정적 파일)
- **플랫폼**: Ubuntu 22.04 LTS
- **모니터링**: 실시간 리소스 추적

## 📱 API 엔드포인트

### 🔐 인증
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인 (JWT 토큰 발급)

### 🍽️ 식사 기록 
- `GET /meal-records` - 식사 기록 목록 조회
- `POST /meal-records` - 식사 기록 생성 (이미지 업로드 포함)
- `GET /meal-records/:id` - 특정 식사 기록 상세 조회  
- `PATCH /meal-records/:id` - 식사 기록 수정
- `DELETE /meal-records/:id` - 식사 기록 삭제
- `GET /meal-records/search` - 식사 기록 검색 (메뉴, 장소, 메모)
- `GET /meal-records/statistics` - 개인 통계 (총 기록수, 평균 별점 등)

### 🏪 음식점 관리
- `GET /restaurants` - 음식점 목록 조회
- `GET /restaurants/:id` - 개별 음식점 상세 정보
- `GET /restaurants/:id/meals` - 특정 음식점의 식사 기록들
- `GET /restaurants/maps` - 음식점 맵 목록
- `POST /restaurants/maps` - 새로운 음식점 맵 생성
- `GET /restaurants/maps/:id` - 특정 맵 상세 정보

### 📂 파일 관리
- `POST /uploads` - 이미지 파일 업로드
- `GET /uploads/:filename` - 업로드된 이미지 조회

### 🔍 통합 검색  
- `GET /search` - 통합 검색 (식사기록 + 음식점)
- `GET /search/restaurants` - 음식점 전용 검색

## ⚡ 성능 최적화

### 🎯 Frontend 최적화
- **Next.js 15 Turbopack**: 빠른 개발 서버 및 빌드
- **Hybrid Rendering**: 페이지별 최적 렌더링 (SSG/SSR/CSR)
- **Image Optimization**: WebP/AVIF 자동 변환, 지연 로딩
- **Code Splitting**: 라우트별 청크 분할로 초기 로딩 최적화
- **Bundle Analysis**: 
  ```
  ○ Static Pages: 11개 사전 렌더링
  ƒ Dynamic Pages: 서버사이드 렌더링 
  First Load JS: 153kB (최적화됨)
  ```

### 🔧 Backend 최적화
- **TypeScript 컴파일**: 프로덕션 빌드 최적화
- **SQLite WAL Mode**: 동시 읽기/쓰기 성능 향상
- **구조화된 로깅**: Winston을 통한 효율적 로그 관리
- **JWT 캐싱**: 인증 성능 최적화

### 🚀 배포 최적화
- **스마트 의존성 관리**: 변경된 패키지만 재설치
- **빌드 캐시**: 소스 변경시에만 재빌드
- **PM2 리소스 제한**: 메모리 사용량 제한으로 안정성 확보
- **리소스 모니터링**: CPU, 메모리, 디스크 실시간 추적

## 🚀 빠른 시작

### 🎯 개발 환경 (권장 방법)

#### 1. 저장소 클론 및 설정
```bash
git clone https://github.com/jynius/DailyMeal.git
cd DailyMeal
```

#### 2. 통합 개발 서버 실행 (한 번에)
```bash
# 개발 서버 시작 (프론트엔드 + 백엔드)
npm run dev
# 또는 PM2 사용
npm run pm2:dev
```

#### 3. 개별 서버 실행
```bash
# 백엔드 (NestJS)
cd backend && npm run start:dev
# http://localhost:8000 + API 문서: /api-docs

# 프론트엔드 (Next.js)  
cd frontend && npm run dev
# http://localhost:3000
```

### 🏭 프로덕션 배포

#### 🔧 스마트 배포 스크립트 (리소스 최적화)
```bash
# 🚀 스마트 배포 (권장)
./deploy.sh

# 특징:
# ✅ node_modules 보존 (의존성 변경시에만 재설치)
# ✅ 스마트 빌드 (소스 변경시에만 재빌드)  
# ✅ 리소스 모니터링 (메모리, CPU, 디스크 추적)
# ✅ PM2 메모리 제한 (백엔드: 800MB, 프론트엔드: 600MB)
```

#### 📋 배포 후 확인
```bash
# 서비스 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 헬스 체크
curl http://localhost:8000/health  # 백엔드
curl http://localhost:3000         # 프론트엔드
```

#### 🔄 GitHub Actions 자동 배포
```yaml
# .github/workflows/deploy.yml
# - 메인 브랜치 푸시시 자동 배포
# - 스마트 의존성 관리 적용
# - 실시간 리소스 모니터링
```

## 🎯 주요 시나리오

### 📱 개인 사용자 시나리오
1. **식사 기록 생성**
   - 📸 음식 사진 업로드
   - ⭐ 별점 평가 (1-5점)
   - 📍 위치 정보 입력
   - 💰 가격 기록
   - 📝 메모 작성

2. **기록 관리 및 탐색**
   - 📊 개인 피드에서 시간순 확인
   - 🔍 메뉴명, 장소, 메모로 검색
   - 📈 통계 확인 (총 기록수, 평균 별점 등)

### 🗺️ 소셜 공유 시나리오
1. **음식점 데이터 활용**
   - 🏪 개별 음식점 페이지 탐색
   - 📍 위치 기반 음식점 발견
   - ⭐ 음식점별 평균 평점 확인

2. **음식점 맵 생성 및 공유**
   - 🗺️ 테마별 음식점 맵 생성 (예: "홍대 맛집 투어", "회사 근처 점심")
   - 📱 개별 음식점 / 맵 SNS 공유
   - 🔗 카카오톡, 페이스북, 트위터, 인스타그램 지원
   - 📋 클립보드 복사 및 네이티브 공유

### 🛠️ 관리자/개발자 시나리오
1. **시스템 모니터링**
   - 📊 실시간 리소스 사용량 추적
   - 🔍 구조화된 로그 분석
   - ⚡ PM2 프로세스 관리

2. **배포 최적화**
   - 🚀 스마트 배포로 다운타임 최소화
   - 💾 의존성 캐시 활용으로 배포 시간 단축
   - 🔄 GitHub Actions 자동 CI/CD

## � 브랜치 전략

| 브랜치 | 환경 | 자동 배포 | 용도 |
|--------|------|-----------|------|
| **`main`** | 🔧 개발 | ❌ | 소스 코드 관리, 기본 개발 브랜치 |
| **`dev`** | 🧪 스테이징 | ✅ | 테스트 서버 자동 배포 |
| **`prod`** | 🚀 운영 | ✅ | 프로덕션 서버 자동 배포 |

### 워크플로우
```
개발 → main 브랜치
테스트 → dev 브랜치 push → 자동 스테이징 배포
배포 → prod 브랜치 push → 자동 프로덕션 배포
```

### CI/CD 파이프라인
- **GitHub Actions**: `.github/workflows/deploy.yml`
- **자동 테스트**: PR 생성 시 백엔드/프론트엔드 테스트 실행
- **자동 배포**: dev/prod 브랜치 push 시 서버 자동 배포
- **환경 변수**: GitHub Secrets로 관리

## �🎨 렌더링 방식 (Hybrid)

- **📄 Static Generation (ISR)**: `/`, `/feed`, `/profile` - 빠른 로딩
- **🔄 Server-Side Rendering**: `/meal/[id]` - SEO 최적화, 소셜 공유 지원

## 🔄 데이터베이스 전환 (개발자용)

기본적으로 SQLite를 사용하지만, PostgreSQL로 전환 가능:

```bash
# PostgreSQL 사용 시
cd backend
echo "DB_TYPE=postgres" >> .env
echo "DB_HOST=localhost" >> .env  
echo "DB_PORT=5432" >> .env
echo "DB_USERNAME=your_username" >> .env
echo "DB_PASSWORD=your_password" >> .env
echo "DB_NAME=dailymeal" >> .env
```

## 🚀 프로덕션 배포

### 프론트엔드
```bash
cd frontend
npm run build
npm start
```

### 백엔드  
```bash
cd backend
npm run build
npm run start:prod
```

## 🚀 빠른 시작 (개발 환경)

### 전체 개발 서버 실행 (추천)
```bash
# 의존성 설치
npm run install:all

# 프론트엔드 + 백엔드 동시 실행
./start-dev.sh
# 또는
npm run dev
```

### 개별 실행
```bash
# 프론트엔드만 실행 (포트: 3000)
npm run dev:frontend

# 백엔드만 실행 (포트: 8000)  
npm run dev:backend
```

### 접속 URL
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/api-docs (Swagger)

### PM2 관리 명령어
```bash
# 상태 확인
pm2 list

# 로그 확인
pm2 logs

# 재시작
pm2 restart all

# 완전 정리
pm2 delete all
```

## 🧪 개발 환경

- **Node.js**: 18.x 이상
- **npm**: 8.x 이상  
- **OS**: Windows, macOS, Linux 지원

## 📸 스크린샷

- 메인 페이지: 로그인/회원가입 폼
- 식사 추가: 사진 업로드 + 상세 정보 입력
- 피드: 시간순 식사 기록 타임라인
- 검색: 키워드 기반 검색 기능
- 프로필: 사용자 통계 및 설정

---

---

## 📋 현재 개발 상태

### ✅ 완료된 기능
- 회원가입/로그인 시스템
- 식사 기록 CRUD (생성, 조회, 수정, 삭제)
- 사진 업로드 및 표시
- 별점 평가 시스템
- 위치 정보 기록
- 가격 및 메모 기능
- 검색 기능 (메뉴명, 장소, 메모)
- 통계 기능 (총 기록 수, 평균 별점)
- PM2 프로세스 관리
- GitHub Actions CI/CD
- Nginx 프로덕션 배포

### 🚧 알려진 이슈
- 로컬 PM2 환경에서 간헐적 연결 문제 (일반 dev 서버는 정상)
- TypeScript strict 모드 적용으로 인한 타입 경고

### 🎯 다음 단계
- 프로덕션 환경 최적화
- 성능 모니터링 도구 추가
- 사용자 피드백 반영

---

**DailyMeal MVP** - 식단 기록의 새로운 경험 🍽️✨