# 🔐 환경 변수 파일 분석 및 정리 가이드

## 📋 현재 환경 변수 파일 현황

### 📂 파일 목록 (4개)

```
DailyMeal/
├── .env.production              # 루트: 프로덕션 환경 변수
├── backend/
│   └── .env                     # 백엔드: 개발 환경 변수
└── frontend/
    ├── .env.local               # 프론트엔드: 개발 환경 변수
    └── .env.local.example       # 프론트엔드: 예제 파일
```

---

## 🔍 각 파일 상세 분석

### 1. **`.env.production`** (루트)

**위치:** `/home/jynius/projects/WebApp/DailyMeal/.env.production`

**내용:**
```bash
NODE_ENV=production
BACKEND_PORT=8000
FRONTEND_PORT=3000
DOMAIN=www.dailymeal.life
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=http://www.dailymeal.life
```

**사용 여부:** ❌ **사용되지 않음!**

**문제점:**
- 파일이 존재하지만 실제로 로드되지 않음
- PM2 ecosystem.config.js에서 직접 env 변수를 정의함
- 중복 관리 가능성

**권장 사항:** 🗑️ **삭제 또는 문서화**

---

### 2. **`backend/.env`**

**위치:** `/home/jynius/projects/WebApp/DailyMeal/backend/.env`

**내용:**
```properties
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=dailymeal

# JWT
JWT_SECRET=dailymeal-jwt-secret-key-change-this-in-production

# Server
PORT=8000
NODE_ENV=development
```

**사용 여부:** ✅ **사용됨**

**사용 위치:**
- `backend/src/app.module.ts`: DB 설정
- `backend/src/main.ts`: 서버 포트

**Git 추적:** ❌ `.gitignore`에 의해 제외됨

**문제점:**
- ⚠️ **예제 파일 없음** (.env.example 필요)
- 🔐 JWT_SECRET이 기본값 (프로덕션에서 위험)

**권장 사항:** 
- ✅ `.env.example` 파일 생성
- 🔒 프로덕션 환경에서 안전한 JWT_SECRET 사용

---

### 3. **`frontend/.env.local`**

**위치:** `/home/jynius/projects/WebApp/DailyMeal/frontend/.env.local`

**내용:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_KAKAO_API_KEY =your_kakao_map_api_key_here
```

**사용 여부:** ✅ **사용됨**

**사용 위치:**
- `frontend/src/lib/constants.ts`: API_BASE_URL 설정
- 여러 페이지 컴포넌트에서 직접 참조

**Git 추적:** ❌ `.gitignore`에 의해 제외됨

**권장 사항:** ✅ 현재 상태 양호

---

### 4. **`frontend/.env.local.example`**

**위치:** `/home/jynius/projects/WebApp/DailyMeal/frontend/.env.local.example`

**내용:**
```bash
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Site URL (frontend)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Kakao Map API Key (선택사항)
# NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_api_key_here
```

**역할:** ✅ 예제/템플릿 파일

**Git 추적:** ✅ 저장소에 포함됨

**권장 사항:** ✅ 현재 상태 양호 (상세한 주석 포함)

---

## ⚠️ 문제점 및 개선 사항

### 🔴 **심각한 문제**

#### 1. **루트 `.env.production` 파일이 사용되지 않음**
```bash
# 현재 상태
.env.production  ← 존재하지만 로드 안 됨

# 실제 사용
ecosystem.config.js  ← 여기서 직접 env 정의
```

**해결 방법:**
- **옵션 A**: `.env.production` 삭제하고 `ecosystem.config.js`만 사용
- **옵션 B**: `dotenv` 사용하도록 수정 (복잡도 증가)

#### 2. **backend/.env.example 파일 없음**
```bash
backend/
├── .env          ← Git에서 제외됨
└── .env.example  ← ❌ 없음! (필요)
```

**문제:**
- 새로운 개발자가 어떤 환경 변수가 필요한지 알 수 없음
- DB 설정, JWT_SECRET 등 필수 변수 누락 가능

---

### 🟡 **개선 필요**

#### 1. **PM2 설정에서 환경 변수 중복**

**ecosystem.config.js (프로덕션)**
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  NEXT_PUBLIC_API_URL: '/api',
  NEXT_PUBLIC_SITE_URL: 'https://ec2-...'
}
```

**ecosystem.dev.config.js (개발)**
```javascript
env: {
  NODE_ENV: 'development',
  PORT: 3000,
  NEXT_PUBLIC_API_URL: 'http://localhost:8000',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000'
}
```

**문제:**
- 환경 변수가 코드에 하드코딩됨
- 변경 시 여러 곳 수정 필요

#### 2. **환경별 설정 분리 불명확**

| 환경 | Backend | Frontend |
|------|---------|----------|
| **개발** | `backend/.env` | `frontend/.env.local` |
| **프로덕션** | ❌ 없음 (PM2에서 정의) | ❌ 없음 (PM2에서 정의) |

---

## ✅ 권장 개선 방안

### 📋 **제안 1: 예제 파일 생성**

#### `backend/.env.example` 생성
```properties
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=dailymeal

# JWT (⚠️ 프로덕션에서 반드시 변경!)
JWT_SECRET=your-secret-key-here

# Server
PORT=8000
NODE_ENV=development
```

#### `backend/.env.production.example` 생성 (선택사항)
```properties
# Database (Production)
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-db-username
DB_PASSWORD=your-secure-password
DB_NAME=dailymeal

# JWT (🔒 안전한 키 사용!)
JWT_SECRET=your-very-secure-production-jwt-secret

# Server
PORT=8000
NODE_ENV=production
```

---

### 📋 **제안 2: 루트 .env.production 처리**

#### 옵션 A: 삭제 (권장) ⭐
```bash
# 파일이 사용되지 않으므로 삭제
rm .env.production
```

**이유:**
- PM2 ecosystem.config.js에서 모든 환경 변수 관리
- 혼란 방지
- 단일 진실 공급원(Single Source of Truth)

#### 옵션 B: 문서화
```bash
# .env.production 파일 상단에 주석 추가
# ⚠️ 주의: 이 파일은 현재 사용되지 않습니다.
# PM2 설정(ecosystem.config.js)에서 환경 변수를 관리합니다.
# 참고용으로만 보관하고 있습니다.
```

---

### 📋 **제안 3: 환경 변수 문서 작성**

`docs/ENVIRONMENT_VARIABLES.md` 생성:

```markdown
# 환경 변수 가이드

## Backend 환경 변수

| 변수명 | 설명 | 개발 기본값 | 프로덕션 예시 |
|--------|------|-------------|---------------|
| DB_HOST | 데이터베이스 호스트 | localhost | your-db.com |
| DB_PORT | 데이터베이스 포트 | 5432 | 5432 |
| JWT_SECRET | JWT 서명 키 | 임시키 | 안전한 랜덤 문자열 |
| PORT | 서버 포트 | 8000 | 8000 |

## Frontend 환경 변수

| 변수명 | 설명 | 개발 기본값 | 프로덕션 예시 |
|--------|------|-------------|---------------|
| NEXT_PUBLIC_API_URL | API 서버 URL | http://localhost:8000 | /api |
| NEXT_PUBLIC_SITE_URL | 사이트 URL | http://localhost:3000 | https://... |
```

---

## 📊 환경 변수 사용 흐름

### **개발 환경**

```
1. 개발자가 .env 파일 생성
   backend/.env          ← .env.example 복사
   frontend/.env.local   ← .env.local.example 복사

2. npm run dev 실행
   → Next.js가 .env.local 자동 로드
   → NestJS가 .env 자동 로드

3. 또는 PM2로 개발
   npm run dev:pm2
   → ecosystem.dev.config.js의 env 변수 사용
```

### **프로덕션 환경**

```
1. 빌드
   npm run build:all
   → 빌드 시점에 NEXT_PUBLIC_* 변수가 번들에 포함됨

2. PM2로 실행
   pm2 start ecosystem.config.js
   → ecosystem.config.js의 env 변수 사용
   → backend는 런타임에 env 변수 읽음
```

---

## 🎯 최종 권장 구조

### **Git에 포함할 파일**
```
✅ frontend/.env.local.example
✅ backend/.env.example
✅ backend/.env.production.example (선택)
✅ ecosystem.config.js
✅ ecosystem.dev.config.js
✅ docs/ENVIRONMENT_VARIABLES.md (신규)
```

### **Git에서 제외할 파일 (.gitignore)**
```
❌ .env
❌ .env.*
❌ backend/.env
❌ backend/.env.production
❌ frontend/.env.local
❌ frontend/.env.production
✅ !.env.example
✅ !.env.*.example
```

### **삭제할 파일**
```
🗑️ .env.production (사용되지 않음)
```

---

## 📝 체크리스트

### 즉시 수행
- [ ] `backend/.env.example` 생성
- [ ] `.env.production` 삭제 또는 문서화
- [ ] `docs/ENVIRONMENT_VARIABLES.md` 작성

### 선택 사항
- [ ] `backend/.env.production.example` 생성
- [ ] PM2 설정을 .env 파일 기반으로 변경 (복잡도 증가)

### 문서화
- [ ] README.md에 환경 변수 섹션 추가
- [ ] 새로운 개발자 온보딩 문서에 환경 변수 설정 가이드 추가

---

## 🔒 보안 주의사항

### ⚠️ 절대 Git에 커밋하지 말 것
- 실제 DB 비밀번호
- 실제 JWT_SECRET (프로덕션)
- API 키 (Kakao Map 등)
- 외부 서비스 인증 정보

### ✅ Git에 안전하게 포함 가능
- 예제 파일 (`.example`)
- localhost 기본값
- 공개 URL/도메인
- 포트 번호

---

**작성일**: 2025-10-08  
**분석 대상**: 4개 환경 변수 파일  
**권장 작업**: 3개 (예제 파일 생성, .env.production 정리, 문서화)
