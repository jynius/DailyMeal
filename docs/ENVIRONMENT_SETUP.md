# 환경 변수 설정 가이드

## 개요

DailyMeal 프로젝트는 개발 환경에서 `.env` 파일과 PM2 설정을 통합하여 일관된 환경 변수 관리를 제공합니다.

## 환경 변수 구조

### 1. 개발 환경 (Development)

개발 환경에서는 두 가지 실행 방법을 지원하며, 모두 동일한 `.env` 파일을 사용합니다:

#### 방법 1: `npm run dev` (Concurrently)
```bash
npm run dev
```
- Backend: `backend/.env` 파일 직접 로드 (NestJS ConfigModule)
- Frontend: `frontend/.env.local` 파일 직접 로드 (Next.js)

#### 방법 2: `npm run dev:pm2` (PM2)
```bash
npm run dev:pm2
```
- `ecosystem.dev.config.js`가 `.env` 파일들을 읽어 PM2 환경 변수로 주입
- Backend와 Frontend 모두 동일한 환경 변수 사용

### 2. 프로덕션 환경 (Production)

프로덕션 환경에서는 `.env` 파일을 사용하지 않고 `ecosystem.config.js`에 환경 변수를 직접 정의합니다:

```bash
npm run deploy
```

> **주의**: 프로덕션에서는 보안을 위해 환경 변수를 파일이 아닌 설정 파일에 직접 작성하거나 시스템 환경 변수를 사용합니다.

## 환경 변수 파일

### Backend: `backend/.env`

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=dailymeal

# JWT Configuration
JWT_SECRET=dailymeal-jwt-secret-key-change-this-in-production

# Server Configuration
PORT=8000
NODE_ENV=development

# File Upload Configuration
UPLOAD_DIR=./uploads
UPLOAD_MAX_FILE_SIZE=5242880
UPLOAD_MAX_FILES=5
```

**중요한 환경 변수:**
- `JWT_SECRET`: JWT 토큰 생성/검증에 사용하는 비밀키 (프로덕션에서는 반드시 변경!)
- `DB_*`: PostgreSQL 데이터베이스 연결 정보
- `UPLOAD_DIR`: 파일 업로드 저장 경로 (기본값: `./uploads`)
- `UPLOAD_MAX_FILE_SIZE`: 파일당 최대 크기 (바이트, 기본값: 5MB)
- `UPLOAD_MAX_FILES`: 최대 업로드 파일 개수 (기본값: 5개)

### Frontend: `frontend/.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Kakao Map API
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
```

**중요한 환경 변수:**
- `NEXT_PUBLIC_KAKAO_MAP_API_KEY`: 카카오 지도 API 키 (필수!)
  - 없으면 지도 기능이 작동하지 않습니다
  - [카카오 개발자 센터](https://developers.kakao.com/)에서 발급

## 초기 설정 방법

### 1. Backend 환경 변수 설정

```bash
cd backend
cp .env.example .env
# .env 파일을 열어 필요한 값 수정
```

### 2. Frontend 환경 변수 설정

```bash
cd frontend
cp .env.local.example .env.local
# .env.local 파일을 열어 KAKAO_MAP_API_KEY 입력
```

### 3. 카카오 지도 API 키 발급

1. [카카오 개발자 센터](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. JavaScript 키 복사
4. `frontend/.env.local`의 `NEXT_PUBLIC_KAKAO_MAP_API_KEY`에 붙여넣기

## PM2 통합 (방안 2)

### dotenv 통합 구조

`ecosystem.dev.config.js` 파일은 시작 시 `.env` 파일들을 읽어옵니다:

```javascript
require('dotenv').config({ path: './backend/.env' });
require('dotenv').config({ path: './frontend/.env.local' });

module.exports = {
  apps: [
    {
      name: 'dailymeal-backend',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || 8000,
        DB_HOST: process.env.DB_HOST,
        JWT_SECRET: process.env.JWT_SECRET,
        // ... 기타 환경 변수
      }
    },
    {
      name: 'dailymeal-frontend',
      env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_KAKAO_MAP_API_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY,
        // ... 기타 환경 변수
      }
    }
  ]
};
```

### 장점

1. **단일 소스**: `.env` 파일만 관리하면 됨
2. **일관성**: `npm run dev`와 `npm run dev:pm2` 모두 동일한 설정 사용
3. **유연성**: PM2 고유 설정도 추가 가능
4. **보안**: `.env` 파일은 `.gitignore`로 제외됨

## 환경 변수 검증

### Backend 환경 변수 확인

```bash
cd backend
npm run start:dev
# 로그에서 "JWT Strategy initialized with secret: ..." 확인
```

### Frontend 환경 변수 확인

브라우저 콘솔에서:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
console.log(process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY)
```

## 문제 해결

### 카카오 지도가 표시되지 않을 때

1. `frontend/.env.local`에 `NEXT_PUBLIC_KAKAO_MAP_API_KEY` 확인
2. API 키가 유효한지 확인
3. PM2 사용 시 `ecosystem.dev.config.js`에 환경 변수가 전달되는지 확인

### JWT 인증 오류 발생 시

1. `backend/.env`의 `JWT_SECRET` 확인
2. Backend 로그에서 JWT secret이 올바르게 로드되었는지 확인
3. 환경 변수 변경 후 서버 재시작 필요

### 데이터베이스 연결 오류

1. `backend/.env`의 `DB_*` 환경 변수 확인
2. PostgreSQL 서버 실행 여부 확인
3. 접속 권한 확인

## 보안 주의사항

1. **절대 `.env` 파일을 Git에 커밋하지 마세요**
2. **프로덕션 환경에서는 반드시 `JWT_SECRET` 변경**
3. **데이터베이스 비밀번호는 강력한 것으로 설정**
4. **카카오 API 키는 공개하지 마세요**

## 관련 문서

- [PM2 설정 가이드](./PM2_SCRIPT_GUIDE.md)
- [배포 가이드](./BUILD_DEPLOY_GUIDE.md)
- [DEV_ENV_CONFLICT.md](../DEV_ENV_CONFLICT.md) - 환경 변수 충돌 해결 과정
- [ENV_ANALYSIS.md](../ENV_ANALYSIS.md) - 환경 변수 파일 분석
