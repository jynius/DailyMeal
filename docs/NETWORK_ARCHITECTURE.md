# DailyMeal 네트워크 아키텍처

## 🏗️ **네트워크 구조도**

```
┌─────────────────────────────────────────────────────────────┐
│ 외부 네트워크 (모바일, 다른 PC)                                │
│                                                             │
│  📱 Expo Go App                    💻 브라우저              │
│     ↓ http://192.168.219.103:3000    ↓                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ Windows Host (192.168.219.103)                              │
│                                                             │
│  🔀 Port Forwarding (netsh portproxy)                       │
│     192.168.219.103:3000 → 172.21.114.94:3000             │
│     192.168.219.103:8000 → 172.21.114.94:8000             │
│                       │                                     │
│  ┌────────────────────┼────────────────────────────────┐   │
│  │ WSL2 Ubuntu (172.21.114.94)        │                │   │
│  │                                    ↓                │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Frontend (Next.js)                          │   │   │
│  │  │ - Listen: 0.0.0.0:3000                     │   │   │
│  │  │ - CORS: localhost, 172.21.114.94           │   │   │
│  │  │ - Socket.IO Client → Backend               │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Backend (NestJS)                            │   │   │
│  │  │ - Listen: 0.0.0.0:8000                     │   │   │
│  │  │ - CORS: localhost, 172.21.114.94           │   │   │
│  │  │ - Socket.IO Server                          │   │   │
│  │  │ - SQLite: ./data/dev.sqlite                │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 **요청 흐름 상세 분석**

### **1. Expo Go 앱에서 웹 접속**

```
1. Expo Go App
   ↓ URL: http://192.168.219.103:3000
   
2. Windows Port Forwarding (자동)
   ↓ 변환: 192.168.219.103:3000 → 172.21.114.94:3000
   
3. WSL2 Next.js 서버
   ↓ 수신: 172.21.114.94:3000
   ↓ Origin 헤더: 172.21.114.94 또는 null
   
4. CORS 체크
   ✅ 'http://172.21.114.94:3000' in allowed origins
   
5. 응답 반환
   ↓ 동일 경로로 역순 전송
   
6. Expo WebView
   ✅ 렌더링 완료
```

### **2. 브라우저에서 API 호출**

```
1. Next.js Frontend (브라우저)
   ↓ fetch(`${NEXT_PUBLIC_API_URL}/api/...`)
   ↓ NEXT_PUBLIC_API_URL=http://192.168.219.103:8000
   
2. Windows Port Forwarding (자동)
   ↓ 변환: 192.168.219.103:8000 → 172.21.114.94:8000
   
3. WSL2 NestJS 서버
   ↓ 수신: 172.21.114.94:8000
   ↓ Origin 헤더: http://172.21.114.94:3000
   
4. CORS 체크
   ✅ 'http://172.21.114.94:3000' in allowed origins
   
5. API 응답 반환
   ↓ JSON 데이터
   
6. Frontend 처리
   ✅ 상태 업데이트
```

### **3. Socket.IO 연결**

```
1. Next.js Frontend (Socket.IO Client)
   ↓ io(NEXT_PUBLIC_API_URL)
   ↓ URL: http://192.168.219.103:8000
   
2. Port Forwarding
   ↓ 변환: 192.168.219.103:8000 → 172.21.114.94:8000
   
3. NestJS Socket.IO Server
   ↓ 수신: 172.21.114.94:8000
   ↓ WebSocket Upgrade 요청
   
4. CORS 체크
   ✅ Origin 허용
   
5. WebSocket 연결 수립
   ↔ 양방향 실시간 통신
   
6. 이벤트 송수신
   ✅ meal-created, meal-updated 등
```

---

## 🎯 **핵심 원리**

### **왜 서버 설정에 192.168.219.103이 불필요한가?**

#### **Port Forwarding의 동작 방식**
```bash
# Windows에서 설정 (netsh portproxy)
listenaddress=192.168.219.103 listenport=3000
connectaddress=172.21.114.94 connectport=3000
```

**이 설정의 의미:**
- 📥 **수신**: Windows 네트워크 인터페이스(192.168.219.103)의 3000 포트
- 📤 **전달**: WSL2(172.21.114.94)의 3000 포트로 **투명하게** 전달
- 🔀 **변환**: **TCP/IP 계층**에서 패킷 주소 자동 변경

#### **서버가 보는 것**
```
클라이언트 요청 → 192.168.219.103:3000
                ↓ (Port Forwarding)
서버 수신 ← 172.21.114.94:3000

서버 입장:
- Source IP: 클라이언트의 실제 IP (또는 localhost)
- Destination IP: 172.21.114.94
- HTTP Origin Header: http://172.21.114.94:3000 (브라우저가 자동 설정)
```

**결론:**
- ✅ 서버는 **172.21.114.94**로 요청을 받음
- ✅ CORS Origin 헤더도 **172.21.114.94** (또는 localhost)
- ❌ 서버는 **192.168.219.103**를 전혀 모름
- ❌ CORS에 192.168.219.103 추가는 **무의미**

---

## 📝 **설정 가이드**

### **1. 서버 설정 (백엔드)**

**backend/src/main.ts**
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',       // ✅ WSL2 내부 접속
    'http://172.21.114.94:3000',   // ✅ Port forwarding 대상
    // ❌ 'http://192.168.219.103:3000' 불필요!
  ],
  credentials: true,
})
```

### **2. 서버 설정 (프론트엔드)**

**frontend/next.config.js**
```javascript
images: {
  remotePatterns: [
    { hostname: 'localhost' },      // ✅ WSL2 내부
    { hostname: '172.21.114.94' },  // ✅ Port forwarding 대상
    // ❌ { hostname: '192.168.219.103' } 불필요!
  ]
}
```

### **3. 클라이언트 설정**

**frontend/.env.local (Windows 네트워크 테스트용)**
```bash
# ✅ 클라이언트는 Windows IP 사용
NEXT_PUBLIC_API_URL=http://192.168.219.103:8000
NEXT_PUBLIC_SITE_URL=http://192.168.219.103:3000
```

**app/App.js (Expo)**
```javascript
const WEB_URL = __DEV__ 
  ? 'http://192.168.219.103:3000'  // ✅ 클라이언트는 Windows IP
  : 'https://ec2-43-202-215-27.ap-northeast-2.compute.amazonaws.com'
```

---

## 🧪 **테스트 시나리오**

### **시나리오 1: WSL2 내부 개발**
```bash
# 서버 시작
npm run dev:pm2

# 브라우저
http://localhost:3000 ✅

# 환경변수
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **시나리오 2: Windows 브라우저 테스트**
```bash
# 서버 시작 (WSL2)
npm run dev:pm2

# 브라우저 (Windows)
http://192.168.219.103:3000 ✅

# 환경변수 (.env.local)
NEXT_PUBLIC_API_URL=http://192.168.219.103:8000
```

### **시나리오 3: Expo Go 앱**
```bash
# 서버 시작 (WSL2)
npm run dev:pm2

# Expo 시작 (WSL2)
cd app
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.219.103 npx expo start

# Expo Go 앱
QR 코드 스캔 ✅
WebView: http://192.168.219.103:3000
```

### **시나리오 4: EC2 프로덕션**
```bash
# EC2에서
export NEXT_PUBLIC_API_URL=https://ec2-43-202-215-27...
npm run build
pm2 restart all

# Nginx 리버스 프록시
proxy_pass http://localhost:3000; ✅ (EC2 내부)
```

---

## ✅ **체크리스트**

### **서버 설정**
- [ ] ✅ Backend CORS: `localhost`, `172.21.114.94` 포함
- [ ] ❌ Backend CORS: `192.168.219.103` **제외**
- [ ] ✅ Next.js Images: `localhost`, `172.21.114.94` 포함
- [ ] ❌ Next.js Images: `192.168.219.103` **제외**
- [ ] ✅ 서버 Listen: `0.0.0.0:3000`, `0.0.0.0:8000`

### **클라이언트 설정**
- [ ] ✅ Windows 테스트: `NEXT_PUBLIC_API_URL=http://192.168.219.103:8000`
- [ ] ✅ Expo App.js: `http://192.168.219.103:3000` (개발 모드)
- [ ] ✅ Expo Metro: `REACT_NATIVE_PACKAGER_HOSTNAME=192.168.219.103`

### **Port Forwarding**
- [ ] ✅ `netsh portproxy` 설정 확인
- [ ] ✅ Windows 방화벽 3000, 8000 포트 허용
- [ ] ✅ `Test-NetConnection` 연결 확인

---

## 🎓 **학습 포인트**

1. **Port Forwarding ≠ Proxy**
   - Port forwarding은 **TCP/IP 계층** 변환
   - 서버는 최종 목적지 IP만 인식
   - 중간 경로 IP는 서버가 모름

2. **CORS는 Origin 헤더 기반**
   - 브라우저가 자동으로 Origin 헤더 추가
   - Origin = 웹페이지가 **로드된** URL
   - Port forwarding 후 최종 주소가 Origin

3. **0.0.0.0 Listen의 의미**
   - 모든 네트워크 인터페이스에서 수신
   - localhost, 172.21.114.94, 기타 IP 모두 가능
   - 보안을 위해 프로덕션에서는 특정 IP 지정 권장

---

## 🎉 **결론**

**핵심 요약:**
- ✅ 클라이언트: `192.168.219.103` 사용
- ✅ Port Forwarding: 자동 변환
- ✅ 서버 설정: `172.21.114.94` 사용
- ❌ 서버 설정: `192.168.219.103` 불필요

**이제 네트워크 구조를 완벽하게 이해했습니다!** 🎓
