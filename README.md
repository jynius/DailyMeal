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
- 실행 주소: http://localhost:3001
- API 문서: http://localhost:3001/api-docs

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

## 🎯 사용법

1. **회원가입/로그인**: 메인 페이지에서 계정 생성 또는 데모 계정 사용
2. **식사 기록**: '+' 버튼을 눌러 사진과 함께 식사 정보 입력
3. **기록 보기**: 피드에서 시간순으로 정렬된 식사 기록 확인
4. **검색**: 메뉴명, 장소, 메모 내용으로 검색 가능
5. **통계 확인**: 프로필에서 식사 기록 통계 확인

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

# 백엔드만 실행 (포트: 3001)  
npm run dev:backend
```

### 접속 URL
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001
- **API 문서**: http://localhost:3001/api (Swagger)

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

**DailyMeal MVP** - 3개월 개발 계획에 따른 기본 기능 구현 완료 ✅