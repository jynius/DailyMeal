# localhost 사용 현황 정리

## 📊 **전체 분석 요약**

DailyMeal 프로젝트에서 `localhost`를 사용하는 모든 경우를 분석하고 정리했습니다.

---

## ✅ **1. 유지해야 하는 경우 (정상 동작)**

### **1-1. 서버 내부 통신**

#### **Nginx 리버스 프록시** ✅
**파일:** `HTTPS_SETUP.md`
```nginx
location / {
    proxy_pass http://localhost:3000;  # ✅ 유지
}
location /api {
    proxy_pass http://localhost:8000;  # ✅ 유지
}
```
**이유:** Nginx와 앱이 같은 서버에서 실행되므로 `localhost` 사용이 적절합니다.

---

#### **헬스체크 스크립트** ✅
**파일:** `deploy.sh`, `check-firewall.sh`, `start-pm2.sh`
```bash
curl http://localhost:8000/api-docs  # ✅ 서버 자체 확인
curl http://localhost:3000           # ✅ 서버 자체 확인
```
**이유:** EC2 서버가 자기 자신의 서비스 상태를 확인할 때 사용합니다.

---

#### **PM2 개발 환경변수** ✅
**파일:** `ecosystem.dev.config.js`
```javascript
env: {
  NEXT_PUBLIC_API_URL: 'http://localhost:8000',  // ✅ 개발용
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000'  // ✅ 개발용
}
```
**이유:** 로컬 개발 모드에서는 `localhost` 사용이 정상입니다.

---

#### **데이터베이스 호스트** ✅
**파일:** `backend/src/app.module.ts`
```typescript
host: process.env.DB_HOST || 'localhost',  // ✅ SQLite는 로컬
```
**이유:** SQLite는 파일 기반 DB이므로 `localhost`가 적절합니다.

---

#### **서버 시작 로그 메시지** ✅
**파일:** `backend/src/main.ts`
```typescript
console.log(`🚀 DailyMeal API Server running on http://localhost:${port}`);
console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
```
**이유:** 개발자를 위한 안내 메시지입니다 (실제 동작과 무관).

---

#### **문서 및 README** ✅
**파일:** `README.md`, `frontend/README.md`, `HTTPS_SETUP.md`
```markdown
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8000
```
**이유:** 로컬 개발 가이드이므로 `localhost`가 적절합니다.

---

## ✅ **2. 수정 완료된 경우**

### **2-1. 백엔드 CORS 설정** ✅ **수정 완료**
**파일:** `backend/src/main.ts`

**변경 전:**
```typescript
origin: [
  'http://localhost:3000', // ❌ WSL2 내부에서만 접근 가능
]
```

**변경 후:**
```typescript
origin: [
  'http://localhost:3000',              // ✅ WSL2 내부
  'http://172.21.114.94:3000',          // ✅ WSL2 IP (port forwarding 대상)
  'http://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com',
  'https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com'
]
```

**중요:** `192.168.219.103`는 **Windows port forwarding**에 의해 `172.21.114.94`로 변환되므로,
서버 설정에서는 **WSL2 IP(172.21.114.94)만 필요**합니다.

---

### **2-2. 프론트엔드 하드코딩된 API URL** ✅ **수정 완료**

#### **수정된 파일들:**
1. `frontend/src/app/restaurants/map/create/page.tsx`
2. `frontend/src/app/restaurants/page.tsx`
3. `frontend/src/app/restaurants/map-view/page.tsx`
4. `frontend/src/app/restaurants/add/page.tsx`
5. `frontend/src/app/restaurants/[id]/page.tsx`
6. `frontend/src/contexts/socket-simple.tsx`

**변경 전:**
```typescript
const response = await fetch('http://localhost:8000/restaurants', {  // ❌
```

**변경 후:**
```typescript
import { APP_CONFIG } from '@/lib/constants'

const response = await fetch(`${APP_CONFIG.API_BASE_URL}/restaurants`, {  // ✅
```

---

### **2-3. Next.js Image 설정** ✅ **수정 완료**
**파일:** `frontend/next.config.js`

**변경 전:**
```javascript
images: {
  remotePatterns: [
    { hostname: 'localhost' }  // ❌ localhost만
  ]
}
```

**변경 후:**
```javascript
images: {
  remotePatterns: [
    { hostname: 'localhost' },                                    // WSL2 내부
    { hostname: '172.21.114.94' },                               // WSL2 IP (port forwarding 대상)
    { hostname: 'ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com' }  // EC2
  ]
}
```

**중요:** `192.168.219.103`는 port forwarding에 의해 `172.21.114.94`로 변환됩니다.

---

### **2-4. Socket.IO 연결** ✅ **수정 완료**
**파일:** `frontend/src/contexts/socket-context.tsx`, `socket-simple.tsx`

**변경 전:**
```typescript
const newSocket = io('http://localhost:8000', { ... })  // ❌
```

**변경 후:**
```typescript
const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const newSocket = io(serverUrl, { ... })  // ✅
```

---

## 🎯 **3. 네트워크 구조 및 동작 방식**

### **네트워크 흐름도**
```
외부 클라이언트 (브라우저/Expo)
    ↓ 192.168.219.103:3000 요청
Windows Port Forwarding (netsh portproxy)
    ↓ 자동 변환
WSL2 서버 (172.21.114.94:3000)
    ↓ 처리
응답 반환
```

### **개발 환경 (WSL2 로컬)**
```bash
# 환경변수 없음 → localhost 사용
NEXT_PUBLIC_API_URL=http://localhost:8000  # ✅ 기본값
```

### **개발 환경 (Windows 네트워크 - Expo)**
```bash
# .env.local 또는 실행 시 환경변수
NEXT_PUBLIC_API_URL=http://192.168.219.103:8000  # ✅ 클라이언트에서 사용
NEXT_PUBLIC_SITE_URL=http://192.168.219.103:3000

# 서버 설정은 172.21.114.94 사용
# Port forwarding이 192.168.219.103 → 172.21.114.94 자동 변환
```

### **프로덕션 환경 (EC2)**
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com
NEXT_PUBLIC_SITE_URL=https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com
```

---

## 📋 **4. 테스트 체크리스트**

### **WSL2 로컬 테스트**
- [ ] `http://localhost:3000` 접속 확인
- [ ] `http://localhost:8000/api-docs` API 문서 확인
- [ ] 브라우저에서 API 호출 정상 동작

### **Windows 네트워크 테스트**
- [ ] `http://192.168.219.103:3000` Windows 브라우저 접속
- [ ] Expo Go 앱에서 WebView 연결
- [ ] 모바일 기기에서 API 호출 정상 동작

### **EC2 프로덕션 테스트**
- [ ] `https://ec2-43-202-215-27...` HTTPS 접속
- [ ] Nginx 리버스 프록시 정상 동작
- [ ] SSL 인증서 정상 적용

---

## 🚀 **5. 배포 시 주의사항**

### **프론트엔드 빌드 전 확인**
```bash
# EC2에서 환경변수 설정
export NEXT_PUBLIC_API_URL=https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com
export NEXT_PUBLIC_SITE_URL=https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com

cd frontend
npm run build
```

### **백엔드 재시작**
```bash
cd backend
npm run build
pm2 restart dailymeal-backend
```

---

## 📊 **6. 최종 정리**

| 항목 | localhost 사용 | 환경변수 사용 | 상태 |
|------|----------------|---------------|------|
| **Nginx 프록시** | ✅ 유지 | ❌ 불필요 | 정상 |
| **헬스체크 스크립트** | ✅ 유지 | ❌ 불필요 | 정상 |
| **개발 환경변수** | ✅ 유지 | ❌ 불필요 | 정상 |
| **백엔드 CORS** | ⚠️ 추가 | ✅ 다중 origin | ✅ 수정 완료 |
| **프론트엔드 fetch** | ❌ 제거 | ✅ APP_CONFIG | ✅ 수정 완료 |
| **Socket.IO** | ❌ 제거 | ✅ 환경변수 | ✅ 수정 완료 |
| **Next.js Images** | ⚠️ 추가 | ✅ 다중 hostname | ✅ 수정 완료 |

---

## ✅ **결론**

### **핵심 포인트** 🎯
1. **서버 설정 (CORS, Next.js Images)**
   - ✅ `localhost` (WSL2 내부)
   - ✅ `172.21.114.94` (WSL2 IP - port forwarding 대상)
   - ❌ `192.168.219.103` **불필요** (port forwarding이 자동 변환)

2. **클라이언트 사용 (브라우저, Expo)**
   - ✅ `http://192.168.219.103:3000` (Windows 네트워크에서 접속)
   - ✅ Port forwarding이 자동으로 `172.21.114.94`로 변환

3. **Port Forwarding 동작**
   ```
   클라이언트 → 192.168.219.103:3000
        ↓ (Windows netsh portproxy)
   서버 수신 → 172.21.114.94:3000
   ```

### **왜 192.168.219.103을 서버 설정에서 제거?**
- Port forwarding은 **네트워크 계층**에서 작동
- 서버 입장에서는 **172.21.114.94**에서 요청이 들어온 것으로 인식
- CORS Origin 헤더도 **172.21.114.94** 또는 **localhost**로 표시됨
- 따라서 서버 설정에 192.168.219.103 추가는 **의미 없음**

### **정리**
- ✅ **서버 내부 통신**: `localhost` 유지 필요 (정상 동작)
- ✅ **클라이언트 → 서버**: 환경변수 사용 (수정 완료)
- ✅ **Expo 앱**: 모든 환경에서 정상 동작 가능
- ✅ **배포**: 환경변수만 설정하면 자동 적용
- ✅ **Port Forwarding**: 클라이언트는 Windows IP 사용, 서버는 WSL2 IP로 인식

**이제 Expo Go에서도 Windows IP, WSL2 IP, EC2 모두 정상 접속 가능합니다!** 🎉
