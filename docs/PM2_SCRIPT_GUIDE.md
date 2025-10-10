# PM2 Script 설정 상세 가이드

## 📊 **질문 1: script 실행 방식 차이**

---

## 🎯 **방식 A: 직접 실행 (프로덕션)**

### **설정**
```javascript
{
  name: 'dailymeal-backend',
  script: 'dist/main.js',  // ← 빌드된 JavaScript 파일
  cwd: './backend'
}
```

### **실제 실행 명령**
```bash
node dist/main.js
```

### **동작 흐름**
```
1. 사전에 빌드 완료 (npm run build)
   ↓
2. TypeScript → JavaScript 변환 완료
   ↓
3. dist/main.js 생성
   ↓
4. PM2가 Node.js로 직접 실행
   ↓
5. 서버 시작 (빠름 ⚡)
```

### **특징**
| 항목 | 설명 |
|------|------|
| **시작 속도** | ⚡ 매우 빠름 (0.5초) |
| **메모리** | 💚 낮음 (~50MB) |
| **CPU** | 💚 낮음 |
| **변경 감지** | ❌ 없음 |
| **재시작** | 수동 빌드 + 재시작 필요 |
| **사용 환경** | ✅ 프로덕션 |

### **장점**
- ✅ 빠른 시작
- ✅ 낮은 리소스 사용
- ✅ 안정적
- ✅ 프로덕션 최적화

### **단점**
- ❌ 코드 변경 시 수동 재빌드 필요
  ```bash
  cd backend
  npm run build
  pm2 restart dailymeal-backend
  ```

---

## 🛠️ **방식 B: NPM 스크립트 실행 (개발)**

### **설정**
```javascript
{
  name: 'dailymeal-backend',
  script: 'npm',              // ← npm 명령어 실행
  args: 'run start:dev',      // ← 스크립트 이름
  cwd: './backend'
}
```

### **실제 실행 명령**
```bash
npm run start:dev

# package.json에서 실행되는 스크립트
# "start:dev": "npx nest start --watch"

# 최종 실행
npx nest start --watch
```

### **동작 흐름**
```
1. PM2가 npm 프로세스 시작
   ↓
2. npm이 start:dev 스크립트 실행
   ↓
3. NestJS CLI가 TypeScript 감지
   ↓
4. 자동 컴파일 (ts-node 사용)
   ↓
5. 서버 시작 (느림 🐌)
   ↓
6. 파일 변경 감지 (--watch)
   ↓
7. 자동 재컴파일 및 재시작 ♻️
```

### **특징**
| 항목 | 설명 |
|------|------|
| **시작 속도** | 🐌 느림 (3-5초) |
| **메모리** | 🔴 높음 (~200MB) |
| **CPU** | 🔴 높음 (watch 모드) |
| **변경 감지** | ✅ 자동 (`--watch`) |
| **재시작** | ✅ 자동 (코드 변경 시) |
| **사용 환경** | ✅ 개발 |

### **장점**
- ✅ 코드 변경 즉시 반영
- ✅ 개발 생산성 향상
- ✅ 수동 재빌드 불필요
- ✅ Hot Reload

### **단점**
- ❌ 느린 시작
- ❌ 높은 메모리 사용
- ❌ 프로덕션 부적합

---

## 📋 **비교 표**

| 항목 | `script: 'dist/main.js'` | `script: 'npm', args: 'run start:dev'` |
|------|--------------------------|----------------------------------------|
| **실행 방식** | Node.js 직접 실행 | npm 스크립트 경유 |
| **언어** | JavaScript (빌드됨) | TypeScript (실시간 컴파일) |
| **시작 속도** | ⚡ 0.5초 | 🐌 3-5초 |
| **메모리** | 💚 50MB | 🔴 200MB |
| **변경 감지** | ❌ | ✅ `--watch` |
| **사전 빌드** | ✅ 필요 | ❌ 불필요 |
| **Hot Reload** | ❌ | ✅ |
| **안정성** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **적합 환경** | 프로덕션 | 개발 |

---

## 🎯 **질문 2: Production API URL 설정**

---

## ❌ **잘못된 설정 (이전)**

```javascript
// ecosystem.config.js
env: {
  NEXT_PUBLIC_API_URL: '/api',  // ❌ 상대 경로
}
```

### **문제점**

#### **1. Nginx 프록시 가정**
```nginx
# Nginx 설정이 필요함 (하지만 없음!)
location /api {
    proxy_pass http://localhost:8000;
}
```

**현재 상황:**
- ❌ Nginx 설정 없음
- ❌ `/api` 요청이 어디로도 전달되지 않음
- ❌ API 호출 실패

#### **2. 프론트엔드 요청 경로**
```javascript
// 브라우저에서 실제 요청되는 URL
fetch(`${NEXT_PUBLIC_API_URL}/restaurants`)
// → fetch('/api/restaurants')
// → https://ec2-...:3000/api/restaurants ❌ (프론트엔드 서버로 요청)
```

#### **3. 원래 의도와 다름**
```
원래 의도: 포트로 구분
Frontend: :3000
Backend:  :8000 ← 직접 호출
```

---

## ✅ **올바른 설정 (수정 완료)**

```javascript
// ecosystem.config.js
env: {
  NEXT_PUBLIC_API_URL: 'http://www.dailymeal.life:8000',
  NEXT_PUBLIC_SITE_URL: 'https://www.dailymeal.life'
}
```

### **동작 방식**
```javascript
// 프론트엔드 코드
fetch(`${NEXT_PUBLIC_API_URL}/restaurants`)

// 실제 요청 URL
// → http://www.dailymeal.life:8000/restaurants
```

### **장점**
- ✅ Nginx 불필요
- ✅ 포트로 직접 구분
- ✅ 단순하고 명확
- ✅ 개발/운영 일관성

---

## 🔀 **두 가지 방식 비교**

### **방식 1: 포트 구분 (현재 선택)** ⭐

```javascript
NEXT_PUBLIC_API_URL: 'http://ec2-...:8000'
```

**네트워크 구조:**
```
Browser
  ↓ http://ec2-...:3000 (Frontend)
  ↓ http://ec2-...:8000 (Backend) ← 직접 호출
```

**장점:**
- ✅ 설정 단순
- ✅ Nginx 불필요
- ✅ CORS 설정만으로 가능

**단점:**
- ⚠️ 포트 8000 외부 노출 필요
- ⚠️ CORS 헤더 필수

---

### **방식 2: Nginx 프록시 (나중에 고려)**

```javascript
NEXT_PUBLIC_API_URL: '/api'  // 상대 경로
```

**Nginx 설정 필요:**
```nginx
server {
    listen 443 ssl;
    
    # 프론트엔드
    location / {
        proxy_pass http://localhost:3000;
    }
    
    # 백엔드 프록시
    location /api {
        proxy_pass http://localhost:8000;
        rewrite ^/api(.*)$ $1 break;  # /api 제거
    }
}
```

**네트워크 구조:**
```
Browser
  ↓ https://ec2-...:443/ (Frontend)
  ↓ https://ec2-...:443/api (Backend)
        ↓ Nginx 프록시
  ↓ http://localhost:8000 (Backend 실제)
```

**장점:**
- ✅ 단일 도메인/포트
- ✅ 보안 강화 (내부 포트 숨김)
- ✅ CORS 불필요
- ✅ SSL 인증서 1개만 필요

**단점:**
- ❌ Nginx 설정 복잡
- ❌ 추가 구성 요소
- ❌ 디버깅 어려움

---

## 📊 **환경별 설정 정리**

### **개발 환경 (WSL2)**

**ecosystem.dev.config.js**
```javascript
{
  name: 'dailymeal-backend',
  script: 'npm',
  args: 'run start:dev',  // ← TypeScript watch 모드
  env: {
    NODE_ENV: 'development',
    PORT: 8000
  }
}

{
  name: 'dailymeal-frontend',
  script: 'npm',
  args: 'run dev',  // ← Next.js dev 모드
  env: {
    NODE_ENV: 'development',
    PORT: 3000,
    NEXT_PUBLIC_API_URL: 'http://localhost:8000',  // ← 로컬
  }
}
```

**특징:**
- ✅ Hot Reload
- ✅ TypeScript watch
- ✅ localhost 사용

---

### **프로덕션 환경 (EC2)**

**ecosystem.config.js**
```javascript
{
  name: 'dailymeal-backend',
  script: 'dist/main.js',  // ← 빌드된 파일 직접 실행
  env: {
    NODE_ENV: 'production',
    PORT: 8000
  }
}

{
  name: 'dailymeal-frontend',
  script: 'npm',
  args: 'run start',  // ← Next.js production 빌드
  env: {
    NODE_ENV: 'production',
    PORT: 3000,
    NEXT_PUBLIC_API_URL: 'http://ec2-...:8000',  // ← 포트 구분
  }
}
```

**특징:**
- ✅ 최적화된 빌드
- ✅ 빠른 실행
- ✅ 낮은 리소스 사용
- ✅ 포트로 직접 구분

---

## 🚀 **배포 워크플로우**

### **개발 (WSL2)**
```bash
# 1. 서버 시작
npm run dev:pm2

# 2. 코드 수정
# → 자동 재컴파일 및 재시작 ✅

# 3. 확인
curl http://localhost:3000
curl http://localhost:8000/api-docs
```

---

### **프로덕션 (EC2)**
```bash
# 1. 빌드
cd backend && npm run build
cd ../frontend && npm run build

# 2. PM2 시작
pm2 start ecosystem.config.js

# 3. 확인
curl http://localhost:3000
curl http://localhost:8000/api-docs

# 4. 외부 접근 확인
# http://ec2-...:3000
# http://ec2-...:8000/api-docs
```

---

## ✅ **체크리스트**

### **개발 환경**
- [ ] ✅ `script: 'npm'` 사용
- [ ] ✅ `args: 'run start:dev'` (Backend)
- [ ] ✅ `args: 'run dev'` (Frontend)
- [ ] ✅ `watch: true` (Backend)
- [ ] ✅ `NEXT_PUBLIC_API_URL: 'http://localhost:8000'`

### **프로덕션 환경**
- [ ] ✅ Backend 빌드 완료 (`npm run build`)
- [ ] ✅ `script: 'dist/main.js'` (Backend)
- [ ] ✅ `script: 'npm', args: 'run start'` (Frontend)
- [ ] ✅ `watch: false`
- [ ] ✅ `NEXT_PUBLIC_API_URL: 'http://ec2-...:8000'`
- [ ] ✅ 포트 3000, 8000 방화벽 오픈

---

## 🎓 **핵심 요약**

### **Script 실행 방식**
1. **`script: 'dist/main.js'`**
   - 직접 실행 (프로덕션)
   - 빠르고 안정적
   - 사전 빌드 필요

2. **`script: 'npm', args: 'run start:dev'`**
   - npm 스크립트 경유 (개발)
   - 자동 재컴파일
   - Hot Reload

### **API URL 설정**
1. **`/api` (Nginx 프록시)**
   - 단일 도메인/포트
   - Nginx 설정 필요
   - 복잡하지만 안전

2. **`http://ec2-...:8000` (포트 구분)** ⭐
   - 단순하고 명확
   - Nginx 불필요
   - CORS 설정만 필요
   - **현재 선택된 방식**

---

## 🎉 **결론**

1. **개발**: npm 스크립트로 Hot Reload
2. **프로덕션**: 빌드된 파일 직접 실행
3. **API URL**: 포트로 직접 구분 (단순함)

**이제 모든 설정이 올바르게 되었습니다!** ✅
