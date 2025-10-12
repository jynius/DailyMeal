# WSL2 방화벽 설정 가이드

## 🔥 방화벽 문제 해결 방법

### 현재 네트워크 설정
- **WSL2 IP**: 172.21.114.94
- **Windows 호스트 IP**: 10.255.255.254
- **사용 포트**:
  - Next.js 프론트엔드: 3000
  - NestJS 백엔드: 8000
  - Expo Metro: 8081

---

## 방법 1: Windows 방화벽 규칙 추가 (권장)

### PowerShell(관리자 권한)에서 실행:
```powershell
# 포트 3000, 8000, 8081 허용
New-NetFirewallRule -DisplayName "WSL Next.js Dev" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "WSL Backend API" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "WSL Expo Metro" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
```

---

## 방법 2: WSL2 포트 포워딩 스크립트 사용

### 1. PowerShell(관리자 권한)에서 실행:
```powershell
cd C:\Users\[사용자명]\projects\WebApp\DailyMeal
.\wsl-port-forward.ps1
```

### 2. 또는 수동으로 포트 포워딩:
```powershell
# WSL IP 확인
wsl hostname -I

# 포트 포워딩 추가
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.21.114.94
netsh interface portproxy add v4tov4 listenport=8000 listenaddress=0.0.0.0 connectport=8000 connectaddress=172.21.114.94
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=172.21.114.94

# 포트 포워딩 확인
netsh interface portproxy show all
```

---

## 방법 3: Windows 호스트 IP 사용 (가장 간단)

### App.js 수정:
```javascript
const WEB_URL = __DEV__ 
  ? 'http://10.255.255.254:3000'  // Windows 호스트 IP
  : 'https://www.dailymeal.life';
```

### Next.js를 Windows 호스트에서 접근 가능하도록 실행:
```bash
cd frontend
npm run dev -- -H 0.0.0.0
# 또는
next dev -H 0.0.0.0
```

---

## 방법 4: WSL2 미러 모드 (Windows 11 22H2 이상)

### .wslconfig 파일 생성 (Windows 사용자 홈 디렉토리):
```
C:\Users\[사용자명]\.wslconfig
```

### 내용:
```ini
[wsl2]
networkingMode=mirrored
```

### WSL 재시작:
```powershell
wsl --shutdown
```

---

## 테스트 방법

### 1. 웹 서버 실행 확인 (WSL에서):
```bash
curl http://localhost:3000
curl http://172.21.114.94:3000
```

### 2. Windows에서 접근 확인 (PowerShell):
```powershell
curl http://172.21.114.94:3000
```

### 3. 스마트폰에서 접근 확인:
- 스마트폰과 PC가 같은 Wi-Fi에 연결되어 있어야 함
- 브라우저에서 `http://172.21.114.94:3000` 접속 테스트

---

## 문제 해결

### "Connection refused" 오류
1. 서버가 실제로 실행 중인지 확인
2. 방화벽 규칙이 추가되었는지 확인
3. WSL2 IP가 변경되지 않았는지 확인 (재부팅 시 변경될 수 있음)

### WSL2 IP가 자주 변경되는 경우
- 방법 3 (Windows 호스트 IP) 또는 방법 4 (미러 모드) 사용 권장

### 스마트폰에서 연결 안 되는 경우
1. PC와 스마트폰이 같은 Wi-Fi 네트워크에 연결되어 있는지 확인
2. Windows 방화벽에서 "공용 네트워크"도 허용되어 있는지 확인
3. 공유기의 AP 격리(AP Isolation) 기능이 꺼져있는지 확인

---

## 추천 설정

**개발 환경**: 방법 1 (방화벽 규칙) + 현재 WSL IP 사용  
**배포 환경**: 프로덕션 도메인 사용

현재 `App.js`에 설정된 IP(`172.21.114.94`)로 잘 동작할 것입니다!
