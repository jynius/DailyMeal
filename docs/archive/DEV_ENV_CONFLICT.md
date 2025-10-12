# 🔄 개발 환경 설정 중복 문제 분석

## 🤔 현재 상황: 두 가지 개발 방법

### **방법 1: `npm run dev` (Concurrently)** 
```bash
npm run dev
```
- ✅ **backend/.env** 파일 사용
- ✅ **frontend/.env.local** 파일 사용
- ✅ NestJS `ConfigModule.forRoot()` 자동 로드
- ✅ Next.js 자동 로드
- 🎯 터미널에서 직접 로그 확인

### **방법 2: `npm run dev:pm2` (PM2)**
```bash
npm run dev:pm2
# 또는
pm2 start ecosystem.dev.config.js
```
- ✅ **ecosystem.dev.config.js**의 `env` 변수 사용
- ❌ backend/.env 파일 **무시됨** (PM2가 env 덮어씀)
- ❌ frontend/.env.local 파일 **무시됨** (PM2가 env 덮어씀)
- 🎯 백그라운드 실행, `pm2 logs`로 확인

---

## 🔍 문제: 환경 변수 우선순위

### **NestJS (Backend)**

```typescript
// backend/src/app.module.ts
ConfigModule.forRoot({
  isGlobal: true,  // ← .env 파일 자동 로드
}),

// 사용
process.env.DB_HOST || 'localhost'
```

**우선순위:**
1. **PM2 env 변수** (ecosystem.dev.config.js) 🥇
2. **.env 파일** (backend/.env)
3. **기본값** (코드 내 fallback)

**결과:**
- `npm run dev` → `.env` 파일 사용 ✅
- `npm run dev:pm2` → PM2 env 사용, `.env` **무시됨** ⚠️

---

### **Next.js (Frontend)**

```typescript
// frontend/src/lib/constants.ts
API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```

**우선순위:**
1. **PM2 env 변수** (ecosystem.dev.config.js) 🥇
2. **.env.local 파일**
3. **기본값** (코드 내 fallback)

**결과:**
- `npm run dev` → `.env.local` 파일 사용 ✅
- `npm run dev:pm2` → PM2 env 사용, `.env.local` **무시됨** ⚠️

---

## 📊 비교 분석

| 항목 | npm run dev | npm run dev:pm2 |
|------|-------------|-----------------|
| **backend 환경 변수** | backend/.env | ecosystem.dev.config.js |
| **frontend 환경 변수** | frontend/.env.local | ecosystem.dev.config.js |
| **실행 방식** | Foreground | Background (PM2) |
| **로그 확인** | 터미널 직접 출력 | `pm2 logs` |
| **Hot Reload** | ✅ 자동 | ✅ 자동 (watch: true) |
| **재시작** | Ctrl+C 후 재실행 | `pm2 restart` |
| **중지** | Ctrl+C | `pm2 stop` |

---

## 🎯 현재 문제점

### 1️⃣ **중복 관리**
```
개발 환경 설정이 2곳에 존재:
├── backend/.env              ← npm run dev용
├── frontend/.env.local       ← npm run dev용
└── ecosystem.dev.config.js   ← npm run dev:pm2용
```

**문제:**
- 같은 설정을 두 곳에서 관리
- 한 곳만 변경하면 불일치 발생
- 어느 것이 사용되는지 혼란

### 2️⃣ **.env 파일이 무의미해짐 (PM2 사용 시)**
```bash
# PM2로 개발하면
npm run dev:pm2

# 이 파일들이 무시됨
backend/.env         ❌ 사용 안 됨
frontend/.env.local  ❌ 사용 안 됨
```

### 3️⃣ **ecosystem.dev.config.js에 하드코딩**
```javascript
env: {
  NODE_ENV: 'development',
  PORT: 8000,
  NEXT_PUBLIC_API_URL: 'http://localhost:8000',  // ← 하드코딩
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000'  // ← 하드코딩
}
```

**문제:**
- 개발자마다 다른 포트나 URL 사용 시 불편
- WSL2 IP (172.21.114.94) 사용하려면 파일 수정 필요

---

## ✅ 해결 방안

### **방안 1: PM2 중심 (권장)** ⭐⭐⭐⭐

PM2를 주 개발 환경으로 사용하고, .env 파일 제거

#### 장점
- ✅ 단일 설정 파일 (ecosystem.dev.config.js)
- ✅ 프로덕션과 동일한 프로세스 관리
- ✅ 백그라운드 실행 편리

#### 단점
- ⚠️ PM2 설정 파일을 직접 수정해야 함
- ⚠️ 개발자별 커스터마이징 어려움

#### 구현
```bash
# 1. .env 파일 삭제 (또는 .env.example으로만 유지)
rm backend/.env
rm frontend/.env.local

# 2. ecosystem.dev.config.js만 사용
npm run dev:pm2

# 3. .gitignore에서 .env 유지 (혹시 누군가 만들 수 있으니)
```

---

### **방안 2: .env 파일 중심 + PM2 통합** ⭐⭐⭐⭐⭐

PM2가 .env 파일을 읽도록 수정

#### 장점
- ✅ 개발자별 커스터마이징 쉬움 (.env 파일만 수정)
- ✅ npm run dev와 npm run dev:pm2 모두 같은 설정 사용
- ✅ .env 파일이 Git에서 제외되어 보안 유지

#### 단점
- ⚠️ PM2 설정 파일 수정 필요
- ⚠️ dotenv 패키지 필요

#### 구현

**ecosystem.dev.config.js 수정:**
```javascript
// 상단에 추가
require('dotenv').config({ path: './backend/.env' });
require('dotenv').config({ path: './frontend/.env.local' });

module.exports = {
  apps: [
    {
      name: 'dailymeal-backend',
      script: 'npm',
      args: 'run start:dev',
      cwd: './backend',
      env: {
        // .env 파일에서 자동으로 로드됨
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || 8000,
        // 기타 변수도 .env에서 자동 로드
      },
      // ...
    },
    {
      name: 'dailymeal-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './frontend',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.FRONTEND_PORT || 3000,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
      // ...
    }
  ]
};
```

**필요한 패키지:**
```bash
npm install dotenv --save-dev
```

---

### **방안 3: 두 가지 방법 모두 유지** ⭐⭐

현재 상태 유지, 문서만 명확히

#### 장점
- ✅ 개발자가 선호하는 방식 선택 가능

#### 단점
- ❌ 중복 관리
- ❌ 혼란 지속
- ❌ 불일치 위험

#### 구현
```markdown
# 개발 가이드에 명시

## 개발 방법

### 방법 1: 터미널에서 직접 실행 (추천)
- .env 파일 사용
- 로그 직접 확인
```bash
npm run dev
```

### 방법 2: PM2 백그라운드 실행
- ecosystem.dev.config.js 사용
- .env 파일 무시됨 (주의!)
```bash
npm run dev:pm2
```

⚠️ 주의: 두 방법은 다른 환경 변수를 사용합니다!
```

---

## 🎯 최종 권장: 방안 2

### **이유:**
1. ✅ 개발자 친화적 (.env 파일로 쉽게 커스터마이징)
2. ✅ 일관성 (npm run dev, npm run dev:pm2 모두 같은 설정)
3. ✅ 보안 (.env 파일은 Git에서 제외)
4. ✅ 유연성 (PM2도 사용, 직접 실행도 가능)

### **구현 단계:**

#### 1️⃣ dotenv 설치
```bash
npm install dotenv --save-dev
```

#### 2️⃣ ecosystem.dev.config.js 수정
```javascript
require('dotenv').config({ path: './backend/.env' });
require('dotenv').config({ path: './frontend/.env.local' });

// 나머지 설정에서 process.env.* 사용
```

#### 3️⃣ .env.example 파일 생성
```bash
backend/.env.example
frontend/.env.local.example
```

#### 4️⃣ 문서 업데이트
```markdown
# 개발 시작하기

1. 환경 변수 파일 복사
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   ```

2. 필요시 환경 변수 수정

3. 개발 서버 실행
   ```bash
   npm run dev        # 또는
   npm run dev:pm2
   ```
```

---

## 📝 작업 체크리스트

### 방안 2 선택 시
- [ ] `npm install dotenv --save-dev`
- [ ] `ecosystem.dev.config.js` 수정 (dotenv 로드)
- [ ] `backend/.env.example` 생성
- [ ] `frontend/.env.local.example` 업데이트 (이미 있음)
- [ ] `README.md` 또는 `docs/DEVELOPMENT.md` 업데이트
- [ ] 팀원들에게 공지 및 .env 파일 복사 안내

### 방안 1 선택 시
- [ ] `backend/.env` 삭제
- [ ] `frontend/.env.local` 삭제
- [ ] `ecosystem.dev.config.js`만 사용하도록 문서화
- [ ] `.env.example` 파일들을 참고용으로만 유지

---

**결론:**
- PM2를 사용하면 `.env` 파일이 무시됩니다.
- 통합하려면 **방안 2**를 권장합니다.
- 단순화하려면 **방안 1**을 선택하세요.
