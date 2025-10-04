# DailyMeal 🍽️

매일의 식사를 기록하고 추억을 남기는 식단 기록 앱

## ✨ 주요 기능

- 📸 **사진 기반 식사 기록**: 음식 사진과 함께 상세 정보 기록
- ⭐ **별점 평가 시스템**: 1-5점 별점으로 음식 평가
- 📍 **위치 정보**: 식사 장소 기록
- 💰 **가격 기록**: 음식 가격 정보 저장
- 📝 **메모 기능**: 간단한 후기나 메모 작성
- 🔍 **검색 기능**: 메뉴, 장소, 메모 내용 검색
- 📊 **통계 보기**: 총 기록 수, 평균 별점, 방문 장소 수

## 🏗️ 프로젝트 구조 (모노레포)

```
/
├── frontend/          # Next.js 14 + TypeScript + Tailwind CSS
│   ├── src/app/       # App Router 페이지들
│   ├── src/components/# 재사용 가능한 컴포넌트들  
│   ├── src/lib/       # 유틸리티 함수 및 API 클라이언트
│   └── src/types/     # TypeScript 타입 정의
│
└── backend/           # NestJS + TypeScript + SQLite
    ├── src/entities/  # TypeORM 엔티티 정의
    ├── src/dto/       # 데이터 전송 객체
    ├── src/auth/      # 인증 관련 모듈
    ├── src/meal-records/ # 식사 기록 관련 모듈
    └── data/          # SQLite 데이터베이스 파일
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

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Lucide Icons
- **State Management**: React Hooks + Local Storage
- **API Client**: Fetch API with custom wrapper

### Backend  
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: SQLite (개발용) / PostgreSQL (프로덕션 지원)
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer

### DevOps & 배포
- **프로세스 관리**: PM2 (로컬 개발 + 프로덕션)
- **CI/CD**: GitHub Actions
- **웹 서버**: Nginx (프로덕션 리버스 프록시)
- **플랫폼**: Ubuntu 22.04 LTS

## 📱 API 엔드포인트

### 인증
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인

### 식사 기록
- `GET /meal-records` - 식사 기록 목록 조회
- `POST /meal-records` - 식사 기록 생성
- `GET /meal-records/:id` - 특정 식사 기록 조회  
- `PATCH /meal-records/:id` - 식사 기록 수정
- `DELETE /meal-records/:id` - 식사 기록 삭제
- `GET /meal-records/search` - 식사 기록 검색
- `GET /meal-records/statistics` - 사용자 통계

## 🚀 빠른 시작

### 🎯 개발 환경 (PM2 권장)
```bash
# 1. 저장소 클론
git clone https://github.com/jynius/DailyMeal.git
cd DailyMeal

# 2. 의존성 설치
npm run install:all

# 3. PM2로 개발 서버 시작 (한 번에 실행)
npm run pm2:dev

# 또는 개별 터미널 실행
# 터미널 1: 백엔드
cd backend && npm run start:dev

# 터미널 2: 프론트엔드  
cd frontend && npm run dev

# 또는 한 번에 시작
npm run dev
```

### 프로덕션 배포
```bash
# PM2를 사용한 배포 (권장)
npm run deploy
# 또는
./deploy.sh

# 서비스 중지
npm run stop
# 또는  
./stop.sh
```

## 🎯 사용법

1. **회원가입/로그인**: 메인 페이지에서 계정 생성 또는 데모 계정 사용
2. **식사 기록**: '+' 버튼을 눌러 사진과 함께 식사 정보 입력
3. **기록 보기**: 피드에서 시간순으로 정렬된 식사 기록 확인
4. **개별 포스트 공유**: 각 식사 기록을 클릭하여 상세 페이지에서 SNS 공유
5. **검색**: 메뉴명, 장소, 메모 내용으로 검색 가능
6. **통계 확인**: 프로필에서 식사 기록 통계 확인

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